import { useQuery } from '@tanstack/react-query';
import { getUserMySelf } from '../api/user';

export function useUserMySelf() {
  return useQuery({
    queryKey: ['user-myself'],
    queryFn: () => getUserMySelf({}),
  });
}
