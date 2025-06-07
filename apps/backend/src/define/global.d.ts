import type { SsoUser } from '../router/auth/auth.type';

declare namespace Express {
  interface Request {
    user: SsoUser;
  }
}

declare module 'express-session' {
  interface SessionData {
    user: SsoUser;
  }
}
