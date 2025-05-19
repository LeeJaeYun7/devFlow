import { ApiProperty } from "@nestjs/swagger";
import { BaseResponse } from "../types";

export class UserGetMySelfDto {}

class UserGetMySelfResponseData {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  provider!: string;

  @ApiProperty({ type: Number })
  remainMessageQuota!: number;
}

export class UserGetMySelfResponse extends BaseResponse {
  @ApiProperty({ type: UserGetMySelfResponseData })
  data!: UserGetMySelfResponseData;
}
