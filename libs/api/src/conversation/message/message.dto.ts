import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { BaseResponse } from '../../types/base.type';

export class MessageRequest {
  @ApiProperty({ description: '채팅방 ID' })
  @IsMongoId()
  @IsNotEmpty()
  chatId!: string;

  @ApiProperty({ description: '메시지 내용' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class MessageResponse extends BaseResponse {
  @ApiProperty({ 
    description: '응답 데이터',
    type: 'object',
    properties: {
      aiResponse: { type: 'string', description: 'ChatGPT 응답 내용' },
      createdAt: { type: 'string', description: '응답 생성 시각', example: '2025-05-08T16:30:00.000Z' }
    }
  })
  data!: {
    aiResponse: string;
    createdAt: Date;
  };
}

export class MessageItem {
  @ApiProperty({ description: '메시지 내용' })
  content!: string;

  @ApiProperty({ description: '메시지 역할' })
  role!: string;

  @ApiProperty({ description: '생성 시각' })
  createdAt!: Date;
}

export class MessageListResponse {
  @ApiProperty({ description: '상태 코드' })
  statusCode!: number;

  @ApiProperty({ 
    description: '응답 데이터',
    type: 'object',
    properties: {
      messages: { 
        type: 'array',
        items: { $ref: '#/components/schemas/MessageItem' },
        description: '메시지 목록'
      }
    }
  })
  data!: {
    messages: MessageItem[];
  };
}