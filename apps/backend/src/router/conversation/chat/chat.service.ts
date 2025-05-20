import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatModel } from '../../../module/mongo/model/chat.model';
import { Model } from 'mongoose';
import { ServiceReturnType } from '@lia/api/types/base.type';
import { ChatResponse, CreateChatDto } from '@lia/api/conversation/chat/create.dto';
import { ChatListDto, ChatListResponse } from '@lia/api/conversation/chat/list.dto';
import { CustomRequestContextService } from '../../../module/custom_request_context/custom_request_context.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatModel.name) private readonly chatModel: Model<ChatModel>,
    private readonly customRequestContext: CustomRequestContextService
  ) {}

  public async listChats(dto: ChatListDto): ServiceReturnType<ChatListResponse> {
    const { limit, page } = dto;
    const offset = (page - 1) * limit;

    const user = this.customRequestContext.get('user');
    const userId = user.id;

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
    const user = this.customRequestContext.get('user');
    const userId = user.id;

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
