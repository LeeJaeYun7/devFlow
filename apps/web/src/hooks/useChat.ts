import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatList, createChat, deleteAllChats } from '../api/chat';
import type { ChatListDto } from '@lia/api/conversation/chat/list.dto';
import { enqueueSnackbar } from 'notistack';

export function useChatList(dto: ChatListDto) {
  return useQuery({ queryKey: ['chatList', dto], queryFn: () => getChatList(dto) });
}

export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createChat(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatList'], exact: false });
      enqueueSnackbar('새로운 채팅이 생성되었습니다', {
        variant: 'success',
        autoHideDuration: 3000,
      });
    },
    onError: () => {
      enqueueSnackbar('채팅 생성에 실패했습니다. 다시 시도해주세요.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    },
  });
}

export function useDeleteAllChats() {
  return useMutation({
    mutationFn: () => deleteAllChats(),
  });
}
