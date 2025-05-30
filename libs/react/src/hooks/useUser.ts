import { useQuery } from '@tanstack/react-query';
import { getUserMySelf } from '../api/user';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

export function useUserMySelf() {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ['user-myself'],
    queryFn: () => getUserMySelf({}),
    retry: false,
    throwOnError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
      return false;
    },
  });
}
