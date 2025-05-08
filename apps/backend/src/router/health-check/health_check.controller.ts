import { BaseResponse } from '@lia/api/types/base.type';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('/health-check')
export class HealthCheckController {
  @Get()
  @ApiResponse({ type: BaseResponse })
  public async healthCheck(): Promise<BaseResponse> {
    return { statusCode: HttpStatus.OK };
  }
}
