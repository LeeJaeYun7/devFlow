// chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatModel } from '../../../module/mongo/model/chat.model';
import { Model } from 'mongoose';
import { ServiceReturnType } from '@lia/api/types/base.type';
import { ChatResponse } from '@lia/api/conversation/chat/chat.dto';

@Injectable()
export class ChatService {
  constructor(@InjectModel(ChatModel.name) private readonly chatModel: Model<ChatModel>) {}

  async createChat(userId: string): ServiceReturnType<ChatResponse> {
    const createdChat = await this.chatModel.create({
      title: 'New Chat',
      userId: userId,
    });

    return {
      chatId: createdChat.id,
      title: createdChat.title,
    };
  }
}
