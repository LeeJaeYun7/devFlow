import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../types/base.type';

export class AuthCallbackResponse extends BaseResponse {
  @ApiProperty()
  data?: any;
}
