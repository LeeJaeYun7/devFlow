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
      }

      enqueueSnackbar('메시지 전송에 실패했습니다.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    },
  });
}
