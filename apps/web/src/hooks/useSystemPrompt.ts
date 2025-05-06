import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSystemPrompt, patchSystemPrompt } from '../api/systemPrompt';

export function useSystemPrompt() {
  return useQuery({
    queryKey: ['systemPrompt'],
    queryFn: getSystemPrompt,
    select: (data: { data: { systemPrompt: string } }) => data.data.systemPrompt,
  });
}

export function usePatchSystemPrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (systemPrompt: string) => patchSystemPrompt({ systemPrompt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPrompt'] });
    },
  });
}
