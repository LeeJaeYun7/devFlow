import { BaseResponse } from '@lia/api/types/base.type';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller('/health-check')
export class HealthCheckController {
  @Get()
  @ApiResponse({ type: BaseResponse })
  public async healthCheck(): Promise<BaseResponse> {
    return { statusCode: HttpStatus.OK };
  }
}
