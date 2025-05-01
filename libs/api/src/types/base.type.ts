import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class BaseResponse {
  @ApiProperty({ type: Number, example: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ type: String, required: false })
  message?: string;
}

export type ServiceReturnType<T extends BaseResponse> = 'data' extends keyof T
  ? T['data'] extends undefined
    ? Promise<any>
    : Promise<Exclude<T['data'], undefined>>
  : Promise<any>;
