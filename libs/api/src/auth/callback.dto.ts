import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../types/base.type';
import { IsString } from 'class-validator';

export class AuthCallbackResponse extends BaseResponse {
  @ApiProperty()
  data?: any;
}

export class AuthClientCallbackDto {
  @ApiProperty()
  @IsString()
  token!: string;
}

export class AuthClientCallbackResponse extends BaseResponse {}
