import { SsoUser } from '../../router/auth/auth.type';

export interface CustomRequestContext {
  user: SsoUser;
}
