import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../../types/base.type';
import { CreatePaginationResponseData, OffsetPaginationDto } from '../../types/pagination.type';
import { type AuthSso, AuthSsoList } from '../../auth/auth.constant';

export class UserListDto extends OffsetPaginationDto {}

class UserData {
  @ApiProperty({ description: 'provider', enum: AuthSsoList })
  provider!: AuthSso;

  @ApiProperty({ description: 'email' })
  email!: string;

  @ApiProperty({ description: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({ description: 'lastLoginAt' })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'remainingMessages' })
  remainingMessages!: number;
}

class UserListData extends CreatePaginationResponseData(UserData) {}

export class UserListResponse extends BaseResponse {
  @ApiProperty({ type: UserListData })
  data!: UserListData;
}
