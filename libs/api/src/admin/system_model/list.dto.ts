import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../../types';
import type { SystemModelTarget } from './system_model.constant';

export class SystemModelListDto {}

export class SystemModel {
  @ApiProperty({
    description: '모델 타겟',
    example: 'message',
  })
  target!: SystemModelTarget;

  @ApiProperty({
    description: '모델 ID',
    example: 'openai/gpt-3.5-turbo',
  })
  modelId!: string;
}

class SystemModelListData {
  @ApiProperty({
    description: '모델 목록',
    type: [SystemModel],
  })
  models!: SystemModel[];
}

export class SystemModelListResponse extends BaseResponse {
  @ApiProperty({
    description: '모델 목록',
    type: SystemModelListData,
  })
  data!: SystemModelListData;
}
