import { api } from '@lia/react/constants/api.constant';
import type { ChatListDto, ChatListResponse } from '@lia/api/conversation/chat/list.dto';
import type { ChatResponse } from '@lia/api/conversation/chat/create.dto';
import type { DeleteAllChatResponse } from '@lia/api/conversation/chat/delete_all.dto';
import type { DeleteChatDto, DeleteChatResponse } from '@lia/api/conversation/chat/delete.dto';

const BASE_URL = `/api/conversation/chat`;

export async function getChatList(dto: ChatListDto) {
  const res = await api.get<ChatListResponse>(`${BASE_URL}/list`, { params: dto });
  return res.data;
}

export async function createChat() {
  const res = await api.post<ChatResponse>(BASE_URL);
  return res.data;
}

export async function deleteChat(dto: DeleteChatDto) {
  const res = await api.delete<DeleteChatResponse>(`${BASE_URL}`, { data: dto });
  return res.data;
}

export async function deleteAllChats() {
  const res = await api.delete<DeleteAllChatResponse>(`${BASE_URL}/all`);
  return res.data;
}
