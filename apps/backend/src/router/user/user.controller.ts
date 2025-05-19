import { Controller, Get, HttpStatus, Query } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { UserGetMySelfDto, UserGetMySelfResponse } from "@lia/api/user/myself.dto";

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/myself')
  @ApiResponse({ type: UserGetMySelfResponse })
  public async getMySelf(@Query() query: UserGetMySelfDto): Promise<UserGetMySelfResponse> {
    const data = await this.userService.getMySelf(query);
    return { statusCode: HttpStatus.OK, data };
  }
}