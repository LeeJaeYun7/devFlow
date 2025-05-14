import { Controller, Post, HttpStatus, Body, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { MessageRequest, MessageResponse, MessageListResponse } from '@lia/api/conversation/message/message.dto';

@ApiTags('Message')
@Controller('/conversation/message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiResponse({ type: MessageResponse })
  public async createMessage(@Body() request: MessageRequest): Promise<MessageResponse> {
    const data = await this.messageService.createMessage(request.chatId, request.content);
    return {
      statusCode: HttpStatus.CREATED,
      data,
    };
  }

  @Get()
  @ApiResponse({ type: MessageListResponse })
  public async getChatMessages(@Query('chatId') chatId: string): Promise<MessageListResponse> {
    const data = await this.messageService.getChatMessages(chatId);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }
}
