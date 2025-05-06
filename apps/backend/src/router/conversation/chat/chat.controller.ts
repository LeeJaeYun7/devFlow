import { Controller, Post, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatResponse } from './dto/chat.dto';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('/conversation/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiResponse({ type: ChatResponse })
  public async createChat(): Promise<ChatResponse> {
    const chatId = await this.chatService.createChat('68188e2dab3eb7db2e79cfaf');
    return { 
      statusCode: HttpStatus.CREATED, 
      data: { chatId } 
    };
  }
}
