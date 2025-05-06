import axios from 'axios';
import { SystemPromptGetResponse } from '@lia/api/admin/system_prompt/get.dto';
import { SystemPromptPatchDto, SystemPromptPatchResponse } from '@lia/api/admin/system_prompt/patch.dto';

const BASE_URL = 'http://localhost:4600/api/admin/system-prompt';

export async function getSystemPrompt() {
  const res = await axios.get<SystemPromptGetResponse>(BASE_URL);
  return res.data;
}

export async function patchSystemPrompt(dto: SystemPromptPatchDto) {
  const res = await axios.patch<SystemPromptPatchResponse>(BASE_URL, dto);
  return res.data;
}
