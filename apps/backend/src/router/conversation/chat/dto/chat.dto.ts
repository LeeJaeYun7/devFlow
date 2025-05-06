import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@lia/api/types/base.type';

export class ChatResponse extends BaseResponse {
  @ApiProperty({ description: '채팅 ID' })
  chatId!: string;

  @ApiProperty({ description: '채팅 제목' })
  title!: string;
} 