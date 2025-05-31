import { SystemModelListResponse } from '@lia/api/admin/system_model/list.dto';
import { SystemModelPatchDto, SystemModelPatchResponse } from '@lia/api/admin/system_model/patch.dto';
import { api } from '@lia/react/constants/api.constant';

const BASE_URL = `/api/admin/system-model`;

export async function getSystemModelList() {
  const res = await api.get<SystemModelListResponse>(`${BASE_URL}/list`);
  return res.data;
}

export async function patchSystemModel(dto: SystemModelPatchDto) {
  const res = await api.patch<SystemModelPatchResponse>(BASE_URL, dto);
  return res.data;
}
