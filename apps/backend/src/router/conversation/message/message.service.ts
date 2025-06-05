import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { MessageCreateDto, MessageCreateResponse } from '@lia/api/conversation/message/create.dto';
import { MessageListDto, MessageListResponse } from '@lia/api/conversation/message/list.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MessageModel } from '../../../module/mongo/model/conversation/models/message.model';
import { FilterQuery, Model } from 'mongoose';
import { ServiceReturnType } from '@lia/api/types/base.type';
import { MessageRoleMap } from '@lia/api/conversation/message/message.constant';
import { UserMessageQuotaModel } from '../../../module/mongo/model/user/models/user_message_quota.model';
import { DEFAULT_MESSAGE_QUOTA } from '../../../constants/message.constant';
import { ChatQuotaNotEnoughError } from '../chat/chat.error';
import { MessageQuotaNotEnoughError } from './message.error';
import { CustomRequestContextService } from '../../../module/custom_request_context/custom_request_context.service';
import { SseService } from '../../sse/sse.service';
import { ChatModel } from '../../../module/mongo/model/conversation/models/chat.model';
import { Types } from 'mongoose';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(ChatModel.name)
    private readonly chatModel: Model<ChatModel>,

    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageModel>,

    @InjectModel(UserMessageQuotaModel.name)
    private readonly userMessageQuotaModel: Model<UserMessageQuotaModel>,

    private readonly llmService: LlmService,

    private readonly customRequestContext: CustomRequestContextService,

    private readonly sseService: SseService
  ) {}

  public async getChatMessageList(dto: MessageListDto): ServiceReturnType<MessageListResponse> {
    const { chatId, page, limit } = dto;
    const offset = (page - 1) * limit;

    const conditions: FilterQuery<MessageModel> = {
      chatId,
      role: { $in: [MessageRoleMap.user, MessageRoleMap.assistant] },
      content: { $ne: '[function_call]' },
    };

    const messages = await this.messageModel.find(conditions).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
    const total = await this.messageModel.countDocuments(conditions);

    const totalPages = Math.ceil(total / limit);

    return {
      data: messages.map((message) => ({
        id: message._id,
        content: message.content ?? '',
        role: message.role,
        createdAt: message.createdAt,
      })),
      meta: {
        totalPages,
        total,
      },
    };
  }

  public async createMessage(dto: MessageCreateDto): ServiceReturnType<MessageCreateResponse> {
    await this.checkUserMessageQuota();
    const { chatId } = dto;
    await this.checkChatMessageQuota(chatId);

    try {
      await this.llmService.getAnalysisStream({
        chatId,
        message: dto.content,
        cb: (content) => {
          this.sseService.sendEvent({ type: 'chatMessage', data: { chatId, content } });
        },
        endCb: async () => {
          this.sseService.sendEvent({ type: 'chatMessage', data: { chatId, isEnd: true } });
        },
        titleParam: {
          cb: (title) => {
            this.sseService.sendEvent({ type: 'chatTitle', data: { chatId, title } });
          },
          endCb: async (title) => {
            await this.chatModel.updateOne({ _id: chatId }, { $set: { title } });
          },
        },
      });
      return {
        aiResponse: '',
        createdAt: new Date(),
      };
    } finally {
      const user = this.customRequestContext.get('user');
      const userId = user.id;
      await this.userMessageQuotaModel.updateOne({ userId }, { $inc: { remainingMessages: -1 } });
    }
  }

  private async checkUserMessageQuota(): Promise<boolean> {
    const user = this.customRequestContext.get('user');
    const userId = user.id;
    const userMessageQuota = await this.userMessageQuotaModel.findOne({ userId });

    if (userMessageQuota?.lastReset && userMessageQuota.lastReset.getDate() !== new Date().getDate()) {
      await this.userMessageQuotaModel.updateOne(
        { userId },
        { $set: { remainingMessages: DEFAULT_MESSAGE_QUOTA, lastReset: new Date() } }
      );
    } else if (!userMessageQuota || userMessageQuota.remainingMessages <= 0) {
      throw new MessageQuotaNotEnoughError();
    }

    return true;
  }

  private async checkChatMessageQuota(chatId: string): Promise<boolean>{
    const chat = await this.chatModel.findById(chatId).lean();

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.leftMessageCount !== undefined && chat.leftMessageCount <= 0) {
      throw new ChatQuotaNotEnoughError();
    }

    return true;
  }
}
