import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { Request } from 'express';
import { SsoUser } from '../auth.type';
import { AuthSsoMap } from '@lia/api/auth/auth.constant';
import { BaseConfigService } from '@lia/config';

@Injectable()
export class SsoGithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: BaseConfigService) {
    const config = configService.getConfig();
    const isProduction = config.nodeEnv === 'production';
    const baseUrl = isProduction ? 'https://api.asklia.io' : 'http://localhost:4600';
    super({
      clientID: config.githubOauth.clientId,
      clientSecret: config.githubOauth.clientSecret,
      callbackURL: `${baseUrl}/api/auth/github/callback`,
      passReqToCallback: true,
      scope: ['user:email'],
    });
  }

  public async validate(req: Request, accessToken: string, refreshToken: string, profile: Profile): Promise<SsoUser> {
    const { id, username, emails } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('이메일이 존재하지 않습니다.');
    }

    return {
      provider: AuthSsoMap.github,
      id: id.toString(),
      name: username,
      email,
    };
  }
}