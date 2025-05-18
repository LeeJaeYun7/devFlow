import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { MessageCreateDto, MessageCreateResponse } from '@lia/api/conversation/message/create.dto';
import { MessageListDto, MessageListResponse } from '@lia/api/conversation/message/list.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MessageModel } from '../../../module/mongo/model/message.model';
import { FilterQuery, Model } from 'mongoose';
import { ServiceReturnType } from '@lia/api/types/base.type';
import { MessageRoleMap } from '@lia/api/conversation/message/message.constant';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageModel>,
    private readonly llmService: LlmService
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
    const data = await this.analyze(dto.chatId, dto.content);
    return {
      aiResponse: data.content,
      createdAt: data.createdAt,
    };
  }

  private async analyze(chatId: string, content: string): Promise<{ content: string; createdAt: Date }> {
    const messages = await this.messageModel
      .find({
        chatId,
        role: { $in: [MessageRoleMap.user, MessageRoleMap.assistant] },
        content: { $ne: '[function_call]' },
      })
      .sort({ createdAt: 1 });

    await this.messageModel.create({
      chatId,
      content,
      role: MessageRoleMap.user,
    });

    const aiResponse = await this.llmService.getAnalysis(content, messages);

    const assistantMessage = await this.messageModel.create({
      chatId,
      content: aiResponse,
      role: MessageRoleMap.assistant,
    });

    return {
      content: aiResponse ?? '',
      createdAt: assistantMessage.createdAt,
    };
  }

}
