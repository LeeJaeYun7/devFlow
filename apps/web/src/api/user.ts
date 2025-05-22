import { api } from './api.constant';
import type { UserGetMySelfDto, UserGetMySelfResponse } from '@lia/api/user/myself.dto';

const BASE_URL = `/api/user`;

export async function getUserMySelf(_: UserGetMySelfDto) {
  const res = await api.get<UserGetMySelfResponse>(`${BASE_URL}/myself`);
  return res.data;
}
