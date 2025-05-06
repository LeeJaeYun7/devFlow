import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MessageModel } from '../../../module/mongo/model/message.model';
import { Model } from 'mongoose';
import { MessageRoleMap } from '@lia/api/conversation/message/message.constant';
import type { MessageRole } from '@lia/api/conversation/message/message.constant';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(MessageModel.name) private readonly messageModel: Model<MessageModel>
  ) {}

  async createMessage(chatId: string, content: string): Promise<string> {
    const createdMessage = await this.messageModel.create({
      chatId,
      content,
      role: MessageRoleMap.user
    });

    return createdMessage.id;
  }
}
