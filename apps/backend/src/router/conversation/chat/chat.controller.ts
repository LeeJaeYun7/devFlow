import { Controller, Post, HttpStatus, Get, Body, Query, Delete } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatResponse, CreateChatDto } from '@lia/api/conversation/chat/create.dto';
import { ChatService } from './chat.service';
import { ChatListDto, ChatListResponse } from '@lia/api/conversation/chat/list.dto';
import { DeleteAllChatDto, DeleteAllChatResponse } from '@lia/api/conversation/chat/delete_all.dto';

@ApiTags('Chat')
@Controller('/conversation/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/list')
  @ApiResponse({ type: ChatListResponse })
  public async listChats(@Query() query: ChatListDto): Promise<ChatListResponse> {
    const data = await this.chatService.listChats(query);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Post()
  @ApiResponse({ type: ChatResponse })
  public async createChat(@Body() body: CreateChatDto): Promise<ChatResponse> {
    const data = await this.chatService.createChat(body);
    return {
      statusCode: HttpStatus.CREATED,
      data,
    } as ChatResponse;
  }

  @Delete('/all')
  @ApiResponse({ type: DeleteAllChatResponse })
  public async deleteAllChats(@Body() body: DeleteAllChatDto): Promise<DeleteAllChatResponse> {
    await this.chatService.deleteAllChats(body);
    return { statusCode: HttpStatus.OK };
  }
}
