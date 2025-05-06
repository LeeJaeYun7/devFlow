import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { UserMetricDto, UserMetricResponse } from '@lia/api/admin/user/metric.dto';
import { AdminUserService } from './user.service';
import { UserListDto, UserListResponse } from '@lia/api/admin/user/list.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('/admin/user')
export class AdminUserController {
  constructor(private readonly userService: AdminUserService) {}

  @Get('/list')
  @ApiResponse({ type: UserListResponse })
  public async listUser(@Query() query: UserListDto): Promise<UserListResponse> {
    const data = await this.userService.listUser(query);
    return { statusCode: HttpStatus.OK, data };
  }

  @Get('/metric')
  @ApiResponse({ type: UserMetricResponse })
  public async getUserMetric(@Query() query: UserMetricDto): Promise<UserMetricResponse> {
    const data = await this.userService.getUserMetric(query);
    return { statusCode: HttpStatus.OK, data };
  }
}
