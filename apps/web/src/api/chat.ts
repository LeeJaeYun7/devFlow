import axios from 'axios';
import { BASE_API_URL } from './api.constant';
import type { ChatListDto, ChatListResponse } from '@lia/api/conversation/chat/list.dto';
import type { ChatResponse } from '@lia/api/conversation/chat/create.dto';

const BASE_URL = `${BASE_API_URL}/api/conversation/chat`;

export async function getChatList(dto: ChatListDto) {
  const res = await axios.get<ChatListResponse>(`${BASE_URL}/list`, { params: dto });
  return res.data;
}

export async function createChat() {
  const res = await axios.post<ChatResponse>(BASE_URL);
  return res.data;
}
