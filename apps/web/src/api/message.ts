import { api } from './api.constant';
import type { MessageListDto, MessageListResponse } from '@lia/api/conversation/message/list.dto';
import type { MessageCreateDto, MessageCreateResponse } from '@lia/api/conversation/message/create.dto';

const BASE_URL = `/api/conversation/message`;

export async function getMessageList(dto: MessageListDto) {
  const res = await api.get<MessageListResponse>(`${BASE_URL}/list`, { params: dto });
  return res.data;
}

export async function createMessage(dto: MessageCreateDto) {
  const res = await api.post<MessageCreateResponse>(BASE_URL, dto);
  return res.data;
}
