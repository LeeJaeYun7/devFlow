import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { BaseResponse } from '../../types/base.type';

export class MessageCreateDto {
  @ApiProperty({ description: '채팅방 ID' })
  @IsMongoId()
  @IsNotEmpty()
  chatId!: string;

  @ApiProperty({ description: '메시지 내용' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class MessageCreateResponse extends BaseResponse {
  @ApiProperty({
    description: '응답 데이터',
    type: 'object',
    properties: {
      aiResponse: { type: 'string', description: 'ChatGPT 응답 내용' },
      createdAt: { type: 'string', description: '응답 생성 시각', example: '2025-05-08T16:30:00.000Z' },
    },
  })
  data!: {
    aiResponse: string;
    createdAt: Date;
  };
}
