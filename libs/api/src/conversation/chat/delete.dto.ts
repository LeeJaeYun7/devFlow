import { IsString } from 'class-validator';
import { BaseResponse } from '../../types';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteChatDto {
  @ApiProperty({ description: '채팅 ID' })
  @IsString()
  chatId!: string;
}

export class DeleteChatResponse extends BaseResponse {}
