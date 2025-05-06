// chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatModel } from '../../../module/mongo/model/chat.model';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatModel.name) private readonly chatModel: Model<ChatModel>,
  ) {}

  async createChat(userId: string): Promise<string> {
    const createdChat = await this.chatModel.create({
      title: 'New Chat',
      userId: userId,
    });

    return createdChat.id; // 또는 createdChat._id.toString()
  }
}
