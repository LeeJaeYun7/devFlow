import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { BaseResponse } from '../../types/base.type';

export class SystemPromptPatchDto {
  @ApiProperty({
    description: '시스템 프롬프트',
    example: 'You are a helpful assistant.',
  })
  @IsString()
  @IsNotEmpty()
  systemPrompt!: string;
}

export class SystemPromptPatchResponse extends BaseResponse {}
