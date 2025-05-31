import { useQuery } from '@tanstack/react-query';
import { getUserList, getUserMetric } from '../api/user';
import { UserListDto } from '@lia/api/admin/user/list.dto';
import { UserMetricDto } from '@lia/api/admin/user/metric.dto';

export function useUserList(dto: UserListDto) {
  return useQuery({
    queryKey: ['userList', dto.page, dto.limit],
    queryFn: () => getUserList(dto),
  });
}

export function useUserMetric(dto: UserMetricDto) {
  return useQuery({
    queryKey: ['userMetric', dto],
    queryFn: () => getUserMetric(dto),
  });
}
