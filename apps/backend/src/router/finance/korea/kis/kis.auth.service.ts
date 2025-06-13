// kis-auth.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BaseConfigService } from '@lia/config';

@Injectable()
export class KisAuthService {
  private readonly logger = new Logger(KisAuthService.name);
  private accessToken = '';
  private expiresAt = 0;

  constructor(
    private readonly http: HttpService,
    private readonly configService: BaseConfigService
  ) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.expiresAt - 60_000) return this.accessToken;

    const config = this.configService.getConfig();
    const url = `${config.kisBaseUrl}/oauth2/tokenP`;
    const { data } = await this.http.axiosRef.post(url, {
      grant_type: 'client_credentials',
      appkey: config.kisAppKey,
      appsecret: config.kisAppSecret,
    });

    this.accessToken = data.access_token;
    this.expiresAt = now + data.expires_in * 1_000; // 24h
    this.logger.log('KIS access-token 갱신 완료');
    return this.accessToken;
  }
}
