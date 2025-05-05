import { Body, Controller, Get, HttpStatus, Patch, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemPromptPatchDto, SystemPromptPatchResponse } from '@lia/api/admin/system_prompt/patch.dto';
import { SystemPromptGetResponse, SystemPromptGetDto } from '@lia/api/admin/system_prompt/get.dto';
import { SystemPromptService } from './system_prompt.service';

@ApiTags('Admin')
@Controller('/admin/system-prompt')
export class SystemPromptController {
  constructor(private readonly systemPromptService: SystemPromptService) {}

  @Get()
  @ApiResponse({ type: SystemPromptGetResponse })
  public async get(@Query() query: SystemPromptGetDto): Promise<SystemPromptGetResponse> {
    const data = await this.systemPromptService.get(query);
    return { statusCode: HttpStatus.OK, data };
  }

  @Patch()
  @ApiResponse({ type: SystemPromptPatchResponse })
  public async patch(@Body() body: SystemPromptPatchDto): Promise<SystemPromptPatchResponse> {
    await this.systemPromptService.patch(body);
    return { statusCode: HttpStatus.OK };
  }
}
