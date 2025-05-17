import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../../types';

export class CreateChatDto {}

export class ChatResponse extends BaseResponse {
  @ApiProperty({
    description: '응답 데이터',
    type: 'object',
    properties: {
      chatId: { type: 'string', description: '채팅 ID' },
      title: { type: 'string', description: '채팅 제목' },
    },
  })
  data!: {
    chatId: string;
    title: string;
  };
}
