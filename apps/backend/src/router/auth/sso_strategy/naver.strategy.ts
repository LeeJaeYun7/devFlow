import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SsoUser } from '../auth.type';
import { AuthSsoMap } from '@lia/api/auth/auth.constant';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver-v2';
import { BaseConfigService } from '@lia/config';

@Injectable()
export class SsoNaverStrategy extends PassportStrategy<any>(Strategy, 'naver') {
  constructor(private readonly configService: BaseConfigService) {
    const config = configService.getConfig();
    const isProduction = config.nodeEnv === 'production';
    const baseUrl = isProduction ? 'https://api.asklia.io' : 'http://localhost:4600';
    super({
      clientID: config.naverOauth.clientId,
      clientSecret: config.naverOauth.clientSecret,
      callbackURL: `${baseUrl}/api/auth/naver/callback`,
    });
  }

  public async validate(_: any, __: any, profile: Profile): Promise<SsoUser> {
    const { id, email, name } = profile;

    if (!email) {
      throw new UnauthorizedException('네이버 로그인에 실패했습니다.');
    }

    return { provider: AuthSsoMap.naver, id, name, email };
  }
}
