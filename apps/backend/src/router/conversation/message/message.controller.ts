import { Controller, Post, HttpStatus, Body, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { MessageCreateDto, MessageCreateResponse } from '@lia/api/conversation/message/create.dto';
import { MessageListDto, MessageListResponse } from '@lia/api/conversation/message/list.dto';
@ApiTags('Message')
@Controller('/conversation/message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/list')
  @ApiResponse({ type: MessageListResponse })
  public async getChatMessageList(@Query() query: MessageListDto): Promise<MessageListResponse> {
    const data = await this.messageService.getChatMessageList(query);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Post()
  @ApiResponse({ type: MessageCreateResponse })
  public async createMessage(@Body() body: MessageCreateDto): Promise<MessageCreateResponse> {
    const data = await this.messageService.createMessage(body);
    return {
      statusCode: HttpStatus.CREATED,
      data,
    };
  }
}
