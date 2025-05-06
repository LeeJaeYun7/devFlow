import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { BaseResponse } from '@lia/api/types/base.type';

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
  @ApiProperty({ description: '메시지 ID' })
  messageId!: string;
} 