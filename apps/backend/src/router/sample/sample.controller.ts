import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { SampleService } from './sample.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SampleGetDto, SampleGetResponse } from '@lia/api/sample/get.dto';

@ApiTags('Sample')
@Controller('/sample')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Get()
  @ApiResponse({ type: SampleGetResponse })
  public async get(@Query() dto: SampleGetDto): Promise<SampleGetResponse> {
    const data = await this.sampleService.get(dto);
    return { statusCode: HttpStatus.OK, data };
  }
}
