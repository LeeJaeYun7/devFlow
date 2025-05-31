import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../../types';
import {
  SystemModelList,
  SystemModelTargetList,
  type SystemModel,
  type SystemModelTarget,
} from './system_model.constant';
import { IsEnum } from 'class-validator';

export class SystemModelPatchDto {
  @ApiProperty({
    description: '모델 타겟',
    example: 'message',
    enum: SystemModelTargetList,
  })
  @IsEnum(SystemModelTargetList)
  target!: SystemModelTarget;

  @ApiProperty({
    description: '모델 ID',
    example: 'openai/gpt-3.5-turbo',
    enum: SystemModelList,
  })
  @IsEnum(SystemModelList)
  modelId!: SystemModel;
}

export class SystemModelPatchResponse extends BaseResponse {}
