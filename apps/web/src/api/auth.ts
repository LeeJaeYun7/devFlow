import { api } from '@lia/react/constants/api.constant';

const BASE_URL = `/api/auth`;

export async function logout() {
  const res = await api.delete(`${BASE_URL}/logout`);
  return res.data;
}
