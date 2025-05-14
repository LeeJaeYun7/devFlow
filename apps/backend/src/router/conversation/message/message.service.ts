import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { MessageResponse, MessageListResponse } from '@lia/api/conversation/message/message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MessageModel } from '../../../module/mongo/model/message.model';
import { Model } from 'mongoose';
import { ServiceReturnType } from '@lia/api/types/base.type';

@Injectable()
export class MessageService {
  constructor(
    private readonly llmService: LlmService,
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageModel>
  ) {}

  async createMessage(chatId: string, content: string): ServiceReturnType<MessageResponse> {
    const { aiResponse, createdAt } = await this.llmService.sendMessage(chatId, content);
    return {
      aiResponse,
      createdAt,
    };
  }

  async getChatMessages(chatId: string): ServiceReturnType<MessageListResponse> {
    const messages = await this.messageModel
      .find({
        chatId,
        role: { $in: ['user', 'assistant'] },
        content: { $ne: '[function_call]' },
      })
      .sort({ createdAt: 1 });
    return {
      messages: messages.map((message) => ({
        content: message.content ?? '',
        role: message.role,
        createdAt: message.createdAt,
      })),
    };
  }
}
