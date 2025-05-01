import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BaseResponse } from '../types/base.type';
import { Sample } from './sample.type';

export class SampleGetDto {
  @ApiProperty()
  @IsString()
  id!: string;
}

export class SampleGetResponse extends BaseResponse {
  @ApiProperty({ type: Sample })
  data!: Sample;
}
