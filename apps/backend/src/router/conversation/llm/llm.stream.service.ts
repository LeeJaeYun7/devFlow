// src/llm/llm.stream.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Readable } from 'stream';
import { Model } from 'mongoose';

import { OpenRouterService } from './open_router/open_router.service';
import { FunctionCallService } from './function-call.service';
import { ParserService } from './parser.service';
import { tools } from './open_router/lia-tools.constant';

import {
  OpenRouterMessage,
  OpenRouterStreamChunk,
  OpenRouterStreamChunkToolCall,
} from './open_router/open_router.type';

import { MessageModel } from '../../../module/mongo/model/conversation/models/message.model';
import { SystemModelModel } from '../../../module/mongo/model/system_model.model';
import { SystemModelTargetMap } from '@lia/api/admin/system_model/system_model.constant';

@Injectable()
export class LlmStreamService {
  constructor(
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageModel>,

    @InjectModel(SystemModelModel.name)
    private readonly systemModelModel: Model<SystemModelModel>,

    private readonly openRouterService: OpenRouterService,
    private readonly parserService: ParserService,
    private readonly functionCallService: FunctionCallService
  ) {}

  public async getTitleStream({ message, cb, endCb }: LLMStreamParam) {
    const systemModel = await this.systemModelModel.findOne({ target: SystemModelTargetMap.title });

    const res = await this.openRouterService.chatStream({
      messages: [
        {
          role: 'system',
          content: systemPromptForTitle,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: systemModel?.modelId,
    });
    const stream = res.data;
    let title = '';
    let lastSentTitle = '';

    stream.on('data', (chunk: Buffer) => {
      const dataList = this.toDataList(chunk);
      for (const data of dataList) {
        try {
          const parsed = JSON.parse(data) as OpenRouterStreamChunk;
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            title += content;
            // 누적된 제목이 이전에 보낸 제목과 다를 때만 전송
            if (title !== lastSentTitle) {
              lastSentTitle = title;
              cb(title);
            }
          }
        } catch {
          // ignore
        }
      }
    });

    stream.on('end', () => {
      if (title && title !== lastSentTitle) {
        cb(title);
      }
      if (title) {
        endCb?.(title);
      }
    });
  }


  async handleFirstStream(
    initialMessages: OpenRouterMessage[],
    chatId: string,
    cb: (content: string) => void,
    endCb: (finalContent: string) => Promise<void>
  ) {
    await this.saveMessage(chatId, initialMessages[initialMessages.length - 1].content, 'user');

    const model = await this.systemModelModel
      .findOne({
        target: SystemModelTargetMap.message,
      })
      .lean();

    const firstResponseStream = await this.openRouterService.chatStream({
      messages: initialMessages,
      tools,
      model: model?.modelId,
    });

    let finalContent = '';
    let isToolCall = false;
    const firstResponseTools: OpenRouterStreamChunkToolCall[] = [];

    const parser = this.parserService.createParser((content) => {
      if (!isToolCall) {
        finalContent += content;
        cb(content);
      }
    });

    firstResponseStream.data.on('data', (chunk: Buffer) => {
      const dataList = this.toDataList(chunk);
      for (const data of dataList) {
        try {
          const parsed = JSON.parse(data) as OpenRouterStreamChunk;
          const delta = parsed.choices[0]?.delta;
          const content = delta?.content;

          if (content) {
            parser.write(content);
          }

          const toolCalls = delta?.tool_calls;
          if (toolCalls) {
            isToolCall = true;
            for (const toolCall of toolCalls) {
              const index = toolCall.index;
              if (index >= firstResponseTools.length) {
                firstResponseTools.push({
                  id: toolCall.id,
                  index,
                  type: 'function',
                  function: {
                    name: toolCall.function.name,
                    arguments: toolCall.function.arguments,
                  },
                });
              } else {
                const targetToolCall = firstResponseTools[index];
                targetToolCall.function.arguments += toolCall.function.arguments ?? '';
              }
            }
          }
        } catch {
          // ignore
        }
      }
    });

    firstResponseStream.data.on('end', async () => {
      if (!isToolCall) {
        endCb(finalContent);
        await this.saveMessage(chatId, finalContent, 'assistant');
        return;
      }

      // Tool call detected — prepare second round
      const newMessages: OpenRouterMessage[] = [
        ...initialMessages,
        {
          role: 'assistant',
          content: null,
          tool_calls: firstResponseTools,
        },
      ];
      // Execute tool functions
      for (const toolCall of firstResponseTools) {
        const functionResult = await this.functionCallService.processFunctionCall(toolCall);
        newMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(functionResult),
        });
      }

      // Second round
      if (!model) {
        throw new Error('System model not found');
      }
      await this.handleSecondStream(newMessages, model, chatId, cb, endCb);
    });
  }

  async handleSecondStream(
    messages: OpenRouterMessage[],
    model: SystemModelModel,
    chatId: string,
    cb: (content: string) => void,
    endCb: (finalContent: string) => Promise<void>
  ) {
    const secondResponseStream = await this.openRouterService.chatStream({
      messages,
      tools,
      model: model?.modelId,
    });

    let finalContent = '';
    const parser = this.parserService.createParser((content) => {
      finalContent += content;
      cb(content);
    });

    secondResponseStream.data.on('data', (chunk: Buffer) => {
      const dataList = this.toDataList(chunk);
      for (const data of dataList) {
        try {
          const parsed = JSON.parse(data) as OpenRouterStreamChunk;
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            parser.write(content);
          }
        } catch {
          // ignore
        }
      }
    });

    secondResponseStream.data.on('end', async () => {
      endCb(finalContent);
      await this.saveMessage(chatId, finalContent, 'assistant');
    });
  }

  private toDataList(chunk: Buffer): string[] {
    try {
      const chunkString = chunk.toString();
      return chunkString
        .split('data: ')
        .map((data) => data.trim())
        .filter((v) => v && v !== ': OPENROUTER PROCESSING' && v !== '[DONE]');
    } catch {
      return [];
    }
  }

  private async saveMessage(chatId: string, content: string | null, role: string) {
    if (!content) return;
    await this.messageModel.insertMany([
      {
        chatId,
        content,
        role,
        createdAt: new Date(),
      },
    ]);
  }
}

const systemPromptForTitle = `This is a stock recommendation service.
Generate a title based on the user's question.
• The title must be within 10 characters.
• Detect the language of the user's question accurately and conservatively.
• Only use Japanese if the input is clearly in Japanese.
• Respond in the same language.
• Respond with the title only – no explanations or extra text.`;

interface LLMStreamParam {
  message: string;
  cb: (content: string) => void;
  endCb?: (finalContent: string) => Promise<void>;
}

