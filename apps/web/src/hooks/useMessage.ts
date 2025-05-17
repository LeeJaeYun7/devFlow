import { useQuery, useMutation } from '@tanstack/react-query';
import { getMessageList, createMessage } from '../api/message';
import type { MessageListDto } from '@lia/api/conversation/message/list.dto';
import type { MessageCreateDto } from '@lia/api/conversation/message/create.dto';
import { enqueueSnackbar } from 'notistack';

export function useMessageList(dto: MessageListDto) {
  return useQuery({ queryKey: ['messageList', dto.chatId, dto.page, dto.limit], queryFn: () => getMessageList(dto) });
}

export function useCreateMessage() {
  return useMutation({
    mutationFn: (dto: MessageCreateDto) => createMessage(dto),
    onError: (error) => {
      enqueueSnackbar('메시지 전송에 실패했습니다.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    },
  });
}
