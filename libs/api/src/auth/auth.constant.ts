export const AuthSsoMap = {
  github: 'github',
} as const;

export const AuthSsoList = Object.values(AuthSsoMap);
export type AuthSso = (typeof AuthSsoList)[number];
