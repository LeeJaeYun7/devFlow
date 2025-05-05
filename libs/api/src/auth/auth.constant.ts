export const AuthSsoMap = {
  kakao: 'kakao',
  google: 'google',
  naver: 'naver',
} as const;

export const AuthSsoList = Object.values(AuthSsoMap);
export type AuthSso = (typeof AuthSsoList)[number];
