declare namespace Express {
  interface Request {
    user: import('../router/auth/auth.type').SsoUser;
  }
}
