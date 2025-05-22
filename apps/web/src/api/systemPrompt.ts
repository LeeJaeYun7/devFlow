import { SystemPromptGetResponse } from '@lia/api/admin/system_prompt/get.dto';
import { SystemPromptPatchDto, SystemPromptPatchResponse } from '@lia/api/admin/system_prompt/patch.dto';
import { api } from './api.constant';

const BASE_URL = `/api/admin/system-prompt`;

export async function getSystemPrompt() {
  const res = await api.get<SystemPromptGetResponse>(BASE_URL);
  return res.data;
}

export async function patchSystemPrompt(dto: SystemPromptPatchDto) {
  const res = await api.patch<SystemPromptPatchResponse>(BASE_URL, dto);
  return res.data;
}
