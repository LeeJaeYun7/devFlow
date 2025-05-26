import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Request } from 'express';
import { SsoUser } from '../auth.type';
import { AuthSsoMap } from '@lia/api/auth/auth.constant';
import { BaseConfigService } from '@lia/config';

@Injectable()
export class SsoGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: BaseConfigService) {
    const config = configService.getConfig();
    const isProduction = config.nodeEnv === 'production';
    const baseUrl = isProduction ? 'https://api.asklia.io' : 'http://localhost:4600';
    super({
      clientID: config.googleOauth.clientId,
      clientSecret: config.googleOauth.clientSecret,
      callbackURL: `${baseUrl}/api/auth/google/callback`,
      passReqToCallback: true,
      scope: ['email', 'profile'],
    });
  }

  public async validate(req: Request, accessToken: string, refreshToken: string, profile: Profile): Promise<SsoUser> {
    const { id, name, emails } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('이메일이 존재하지 않습니다.');
    }

    return {
      provider: AuthSsoMap.google,
      id,
      name: name?.givenName,
      email,
    };
  }
}
