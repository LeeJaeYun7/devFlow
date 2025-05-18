import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { SsoUser } from '../auth.type';
import { AuthSsoMap } from '@lia/api/auth/auth.constant';

@Injectable()
export class SsoKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    const isProduction = configService.get('NODE_ENV') === 'production';
    const baseUrl = isProduction ? 'https://api.lia.ai' : 'http://localhost:4600';
    super({
      clientID: configService.get('KAKAO_OAUTH_CLIENT_ID') ?? 'default',
      callbackURL: `${baseUrl}/api/auth/kakao/callback`,
      passReqToCallback: true,
    });
  }

  public async validate(req: Request, accessToken: string, refreshToken: string, profile: Profile): Promise<SsoUser> {
    const { id, displayName, emails } = profile;
    /**
     * @TODO 카카오 이메일 관련 설정 필요 (심사 이후에 EMAIL 정보 받을 수 있다고 함.)
     */
    const email = emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('카카오 로그인에 실패했습니다.');
    }

    return { provider: AuthSsoMap.kakao, id, name: displayName, email };
  }
}
