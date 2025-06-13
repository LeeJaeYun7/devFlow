import { useQuery, useMutation } from '@tanstack/react-query';
import { getMessageList, createMessage } from '../api/message';
import type { MessageListDto } from '@lia/api/conversation/message/list.dto';
import type { MessageCreateDto } from '@lia/api/conversation/message/create.dto';
import { enqueueSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import type { BaseResponse } from '@lia/api/types';

export interface Message {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
}

export function useMessageList(dto: MessageListDto) {
  return useQuery({
    queryKey: ['messageList', dto.chatId, dto.page, dto.limit],
    queryFn: async () => {
      const response = await getMessageList(dto);
      return response.data;
    },
  });
}

export function useCreateMessage() {
  return useMutation({
    mutationFn: (dto: MessageCreateDto) => createMessage(dto),
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const responseBody = error.response?.data as BaseResponse;
        if (responseBody?.message === 'Llm response failed') {
          enqueueSnackbar(`메세지 생성에 실패했습니다. 다시 시도해주세요.`, {
            variant: 'error',
            autoHideDuration: 5000,
          });
          return;
        }

        if (responseBody?.message === 'User message quota is not enough') {
          enqueueSnackbar(`오늘 메세지 개수를 전부 소모했습니다. 내일 충전되니 다시 시도해주세요.`, {
            variant: 'warning',
            autoHideDuration: 5000,
          });
          return;
        }

        if (responseBody?.message === 'Chat quota is not enough') {
          enqueueSnackbar(`이 채팅에서 더이상 메세지를 보낼 수 없습니다. 새로운 채팅을 생성해주세요.`, {
            variant: 'warning',
            autoHideDuration: 5000,
          });
          return;
        }
      }

      enqueueSnackbar('메시지 전송에 실패했습니다.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    },
  });
}
