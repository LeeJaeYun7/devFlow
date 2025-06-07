import { Injectable, Logger } from '@nestjs/common';
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
import { LlmResponseFailedError } from './llm.error';

@Injectable()
export class LlmChatFlowService {
  private readonly logger = new Logger(LlmChatFlowService.name);

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
    const systemModel = await this.systemModelModel.findOne({ target: SystemModelTargetMap.title });

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

    void this.llmStreamParserService.handleTitleStream({
      messages,
      model: systemModel?.modelId,
      parserCb: (content) => {
        title += content;
        if (title !== lastSentTitle) {
          lastSentTitle = title;
          cb(title);
        }
      },
      endCb: () => {
        if (title && title !== lastSentTitle) {
          cb(title);
        }
        if (title) {
          endCb?.(title);
        }
      },
    });
  }

  public async handleMessageStream(
    initialMessages: OpenRouterMessage[],
    chatId: string,
    cb: (content: string) => void,
    endCb: (finalContent: string) => Promise<void>
  ) {
    const userMessage = initialMessages[initialMessages.length - 1].content;

    const model = await this.systemModelModel
      .findOne({
        target: SystemModelTargetMap.message,
      })
      .lean();

    if (!model) {
      throw new SystemError('System model not found');
    }

    let finalContent = '';
    let isToolCall = false;
    const firstResponseTools: OpenRouterStreamChunkToolCall[] = [];

    const firstStreamPromise = this.llmStreamParserService.handleMessageStream({
      messages: initialMessages,
      tools,
      model: model.modelId,
      retryStrategy: {
        count: 3,
        delay: 200,
        retryInit: async () => {
          finalContent = '';
          isToolCall = false;
          firstResponseTools.length = 0;
        },
      },
      parserCb: (content) => {
        if (!isToolCall) {
          finalContent += content;
          cb(content);
        }
      },
      cb: (chunk) => {
        const toolCalls = chunk.choices[0]?.delta?.tool_calls;
        if (!toolCalls) {
          return;
        }
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
      },
      endCb: async () => {
        if (!isToolCall) {
          await this.saveMessage(chatId, userMessage, MessageRoleMap.user);
          await this.saveMessage(chatId, finalContent, MessageRoleMap.assistant);
          endCb(finalContent);
          return;
        }

        const newMessages: OpenRouterMessage[] = [
          ...initialMessages,
          {
            role: MessageRoleMap.assistant,
            content: null,
            tool_calls: firstResponseTools,
          },
        ];

        for (const toolCall of firstResponseTools) {
          const functionResult = await this.functionCallService.processFunctionCall(toolCall);
          newMessages.push({
            role: MessageRoleMap.tool,
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify(functionResult),
          });
        }

        await this.handleSecondStream(newMessages, userMessage, model, chatId, cb, endCb);
      },
    });

    try {
      await firstStreamPromise;
    } catch (error) {
      this.logger.error(`Llm response failed: ${error}`);
      throw new LlmResponseFailedError('Llm response failed');
    }
  }

  private async handleSecondStream(
    messages: OpenRouterMessage[],
    userMessage: string | null,
    model: SystemModelModel,
    chatId: string,
    cb: (content: string) => void,
    endCb: (finalContent: string) => Promise<void>
  ) {
    let finalContent = '';

    const secondStreamPromise = this.llmStreamParserService.handleMessageStream({
      messages,
      tools,
      model: model?.modelId,
      retryStrategy: {
        count: 1,
        delay: 200,
        retryInit: async () => {
          finalContent = '';
        },
      },
      parserCb: (content) => {
        finalContent += content;
        cb(content);
      },
      endCb: async () => {
        await this.saveMessage(chatId, userMessage, MessageRoleMap.user);
        await this.saveMessage(chatId, finalContent, MessageRoleMap.assistant);
        endCb(finalContent);
      },
    });

    try {
      await secondStreamPromise;
    } catch (error) {
      this.logger.error(`Llm response failed: ${error}`);
      throw new LlmResponseFailedError('Llm response failed');
    }
  }

  private async saveMessage(chatId: string, content: string | null, role: MessageRole) {
    if (!content) return;
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
