import { Controller, Post, HttpStatus, Body } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { MessageRequest, MessageResponse } from './dto/message.dto';

@ApiTags('Message')
@Controller('/conversation/message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiResponse({ type: MessageResponse })
  public async createMessage(@Body() request: MessageRequest): Promise<MessageResponse> {
    const messageId = await this.messageService.createMessage(
      request.chatId,
      request.content
    );
    return {
      statusCode: HttpStatus.CREATED,
      data: { messageId }
    };
  }
}
