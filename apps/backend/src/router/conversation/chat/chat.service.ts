// chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatModel } from '../../../module/mongo/model/chat.model';
import { Model } from 'mongoose';
import { ServiceReturnType } from '@lia/api/types/base.type';
import { ChatResponse, CreateChatDto } from '@lia/api/conversation/chat/create.dto';
import { ChatListDto, ChatListResponse } from '@lia/api/conversation/chat/list.dto';

const dumpUserId = '68188e2dab3eb7db2e79cfaf';
@Injectable()
export class ChatService {
  constructor(@InjectModel(ChatModel.name) private readonly chatModel: Model<ChatModel>) {}

  public async listChats(dto: ChatListDto): ServiceReturnType<ChatListResponse> {
    const { limit, page } = dto;
    const offset = (page - 1) * limit;
    const userId = dumpUserId;

    // TODO: Aggregation을 통한 공통 페이지네이션 처리 추가
    const chats = await this.chatModel.find({ userId }).skip(offset).limit(limit).lean();
    const total = await this.chatModel.countDocuments({ userId });
    const totalPages = Math.ceil(total / limit);

    const data = chats.map((v) => {
      return {
        chatId: v._id,
        title: v.title,
      };
    });

    return {
      data,
      meta: { totalPages, total },
    };
  }

  public async createChat(_: CreateChatDto): ServiceReturnType<ChatResponse> {
    const userId = dumpUserId;
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
