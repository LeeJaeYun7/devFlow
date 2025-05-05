import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../../types/base.type';

export class SystemPromptGetDto {}

class SystemPromptGetData {
  @ApiProperty({
    description: '시스템 프롬프트',
    example: 'You are a helpful assistant.',
  })
  systemPrompt!: string;
}

export class SystemPromptGetResponse extends BaseResponse {
  @ApiProperty({ type: SystemPromptGetData })
  data!: SystemPromptGetData;
}
