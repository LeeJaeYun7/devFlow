import type { AuthSso } from '@lia/api/auth/auth.constant';

export interface SsoUser {
  provider: AuthSso;
  id: string;
  name?: string;
  email: string;
}
