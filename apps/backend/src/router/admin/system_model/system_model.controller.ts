import { Body, Controller, Get, HttpStatus, Patch, Query } from '@nestjs/common';
import { SystemModelService } from './system_model.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemModelListDto, SystemModelListResponse } from '@lia/api/admin/system_model/list.dto';
import { SystemModelPatchDto, SystemModelPatchResponse } from '@lia/api/admin/system_model/patch.dto';

@ApiTags('Admin')
@Controller('/admin/system-model')
export class SystemModelController {
  constructor(private readonly systemModelService: SystemModelService) {}

  @Get('/list')
  @ApiResponse({ type: SystemModelListResponse })
  public async getList(@Query() dto: SystemModelListDto): Promise<SystemModelListResponse> {
    const data = await this.systemModelService.getList(dto);
    return { statusCode: HttpStatus.OK, data };
  }

  @Patch()
  @ApiResponse({ type: SystemModelPatchResponse })
  public async patch(@Body() dto: SystemModelPatchDto): Promise<SystemModelPatchResponse> {
    await this.systemModelService.patch(dto);
    return { statusCode: HttpStatus.OK };
  }
}
