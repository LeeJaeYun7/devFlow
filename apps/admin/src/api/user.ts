import { api } from '@lia/react/constants/api.constant';
import { UserListDto, UserListResponse } from '@lia/api/admin/user/list.dto';
import { UserMetricDto, UserMetricResponse } from '@lia/api/admin/user/metric.dto';

const BASE_URL = `/api/admin/user`;

export async function getUserList(dto: UserListDto) {
  const res = await api.get<UserListResponse>(`${BASE_URL}/list`, { params: dto });
  return res.data;
}

export async function getUserMetric(dto: UserMetricDto) {
  const res = await api.get<UserMetricResponse>(`${BASE_URL}/metric`, { params: dto });
  return res.data;
}
