import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FunctionCallService } from './function-call.service';
import { tools } from './open_router/lia-tools.constant';

import { OpenRouterMessage, OpenRouterStreamChunkToolCall } from './open_router/open_router.type';
import { ChatModel } from '../../../module/mongo/model/conversation/models/chat.model';
import { MessageModel } from '../../../module/mongo/model/conversation/models/message.model';
import { SystemModelModel } from '../../../module/mongo/model/system_model.model';
import { SystemModelTargetMap } from '@lia/api/admin/system_model/system_model.constant';
import { MessageRole, MessageRoleMap } from '@lia/api/conversation/message/message.constant';
import { SystemError } from '../../../util/base.error';
import { LlmStreamParserService } from './stream/llm_stream_parser.service';

@Injectable()
export class LlmChatFlowService {
  constructor(
    @InjectModel(ChatModel.name)
    private readonly chatModel: Model<ChatModel>,

    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageModel>,

    @InjectModel(SystemModelModel.name)
    private readonly systemModelModel: Model<SystemModelModel>,

    private readonly functionCallService: FunctionCallService,
    private readonly llmStreamParserService: LlmStreamParserService
  ) {}

  public async handleTitleStream({ message, cb, endCb }: LLMStreamParam) {
    console.log('[handleTitleStream] 시작', { message });
    const systemModel = await this.systemModelModel.findOne({ target: SystemModelTargetMap.title });
    console.log('[handleTitleStream] systemModel', systemModel);

    let title = '';
    let lastSentTitle = '';
    const messages: OpenRouterMessage[] = [
      {
        role: MessageRoleMap.system,
        content: systemPromptForTitle,
      },
      {
        role: MessageRoleMap.user,
        content: message,
      },
    ];

    const stream = await this.llmStreamParserService.createStream({
      messages,
      model: systemModel?.modelId,
      parserCb: (content) => {
        console.log('[handleTitleStream] 수신 content', content);
        title += content;
        if (title !== lastSentTitle) {
          lastSentTitle = title;
          cb(title);
        }
      },
    });

    stream.on('end', () => {
      console.log('[handleTitleStream] 스트림 종료', { finalTitle: title });
      if (title && title !== lastSentTitle) {
        cb(title);
      }
      if (title) {
        endCb?.(title);
      }
    });
  }

  public async handleMessageStream(
    initialMessages: OpenRouterMessage[],
    chatId: string,
    cb: (content: string) => void,
    endCb: (finalContent: string) => Promise<void>
  ) {
    console.log('[handleMessageStream] 시작');
    const userMessage = initialMessages[initialMessages.length - 1].content;

    const model = await this.systemModelModel
      .findOne({
        target: SystemModelTargetMap.message,
      })
      .lean();

    if (!model) {
      console.error('[handleMessageStream] System model not found');
      throw new SystemError('System model not found');
    }
    console.log('[handleMessageStream] model', model);

    let finalContent = '';
    let isToolCall = false;
    const firstResponseTools: OpenRouterStreamChunkToolCall[] = [];

    const firstResponseStream = await this.llmStreamParserService.createStream({
      messages: initialMessages,
      tools,
      model: model.modelId,
      parserCb: (content) => {
        console.log('[handleMessageStream] 수신 content', content);
        if (!isToolCall) {
          finalContent += content;
          cb(content);
        }
      },
      cb: (chunk) => {
        console.log('[handleMessageStream] chunk delta', JSON.stringify(chunk.choices[0]?.delta));
        const toolCalls = chunk.choices[0]?.delta?.tool_calls;
        if (toolCalls) {
          isToolCall = true;
          for (const toolCall of toolCalls) {
            console.log('[handleMessageStream] 수신 toolCall', toolCall);
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
      },
    });

    firstResponseStream.on('end', async () => {
      console.log('[handleMessageStream] 스트림 종료', { isToolCall, finalContent });
      if (!isToolCall) {
        await this.saveMessage(chatId, userMessage, MessageRoleMap.user);
        await this.saveMessage(chatId, finalContent, MessageRoleMap.assistant);
        endCb(finalContent);
        return;
      }

      console.log('[handleMessageStream] Tool call detected, second round 시작');
      const newMessages: OpenRouterMessage[] = [
        ...initialMessages,
        {
          role: MessageRoleMap.assistant,
          content: null,
          tool_calls: firstResponseTools,
        },
      ];
      console.log('[handleMessageStream] newMessages');

      for (const toolCall of firstResponseTools) {
        console.log('[handleMessageStream] functionCall 처리', toolCall);
        const functionResult = await this.functionCallService.processFunctionCall(toolCall);
        console.log('[handleMessageStream] functionResult', functionResult);
        newMessages.push({
          role: MessageRoleMap.tool,
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(functionResult),
        });
      }

      await this.handleSecondStream(newMessages, userMessage, model, chatId, cb, endCb);
    });
  }

  private async handleSecondStream(
    messages: OpenRouterMessage[],
    userMessage: string | null,
    model: SystemModelModel,
    chatId: string,
    cb: (content: string) => void,
    endCb: (finalContent: string) => Promise<void>
  ) {
    console.log('[handleSecondStream] 시작', { messages, chatId });
    let finalContent = '';

    const secondResponseStream = await this.llmStreamParserService.createStream({
      messages,
      tools,
      model: model?.modelId,
      parserCb: (content) => {
        console.log('[handleSecondStream] 수신 content', content);
        finalContent += content;
        cb(content);
      },
    });

    secondResponseStream.on('end', async () => {
      await this.saveMessage(chatId, userMessage, MessageRoleMap.user);
      await this.saveMessage(chatId, finalContent, MessageRoleMap.assistant);
      endCb(finalContent);
    });
  }

  private async saveMessage(chatId: string, content: string | null, role: MessageRole) {
    if (!content) return;
    console.log('[saveMessage] 저장', { chatId, role, content });
    await this.messageModel.insertMany([
      {
        chatId,
        content,
        role,
        createdAt: new Date(),
      },
    ]);

    await this.chatModel.updateOne({ _id: chatId }, { $inc: { leftMessageCount: -1 } });
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
