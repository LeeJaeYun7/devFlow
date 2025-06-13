import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DefaultBaseConfig } from './default_config.constant';

@Injectable()
export class BaseConfigService {
  private readonly config: BaseConfig;

  constructor(private readonly configService: ConfigService) {
    const config = {
      nodeEnv: process.env.NODE_ENV,
      apiPort: this.configService.get('API_PORT'),
      dataCollectorPort: this.configService.get('DATA_COLLECTOR_PORT'),
      jwtSecret: this.configService.get('JWT_SECRET'),
      dartApiKey: this.configService.get('DART_API_KEY'),
      mongodbUri: this.configService.get('MONGODB_URI'),
      kisAppKey: 'PScTCzaCu2tiLDuRmf31ODws2ZjAn9y0Po7Y',
      kisAppSecret: 'VRhRfPaEUtA4ta/V0DDOd+fYqT2JZdmovDpKkGcs9R5fjfZY2SwmH4h7uuHGwZlH0+0JfQF16ectYxNro61iETy9eMUlxQWAOIZzSJWWgLXcw4mHXSsehDkFTSzzRaBWm1G7dv/KqG9E3z+T9GAk2UKnHYroqPd6MuqaJPkFG8w3r3e5jsY=',
      kisBaseUrl: 'https://openapi.koreainvestment.com:9443',

      openRouter: {
        url: this.configService.get('OPENROUTER_URL'),
        apiKey: this.configService.get('OPENROUTER_API_KEY'),
        model: this.configService.get('OPENROUTER_MODEL'),
        temperature: +this.configService.get('OPENROUTER_TEMPERATURE'),
      },
      googleOauth: {
        clientId: this.configService.get('GOOGLE_OAUTH_CLIENT_ID'),
        clientSecret: this.configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
      },
      kakaoOauth: {
        clientId: this.configService.get('KAKAO_OAUTH_CLIENT_ID'),
      },
      naverOauth: {
        clientId: this.configService.get('NAVER_OAUTH_CLIENT_ID'),
        clientSecret: this.configService.get('NAVER_OAUTH_CLIENT_SECRET'),
      },
    } as Partial<BaseConfig>;

    this.config = this.replaceDefaultConfig(config);
  }

  public getConfig(): BaseConfig {
    return this.config;
  }

  private replaceDefaultConfig(config: Partial<BaseConfig>): BaseConfig {
    for (const _key in DefaultBaseConfig) {
      const key = _key as keyof BaseConfig;
      const value = config[key];

      if (typeof DefaultBaseConfig[key] === 'object') {
        for (const _subKey in DefaultBaseConfig[key]) {
          const subKey = _subKey as keyof (typeof DefaultBaseConfig)[typeof key];
          const subValue = value?.[subKey];
          if (subValue === undefined || !this.validateNumberConfig(subValue) || subValue === '') {
            (value as Record<string, any>)[subKey] = DefaultBaseConfig[key][subKey] as never;
          }
        }
      } else if (value === undefined || !this.validateNumberConfig(value)) {
        config[key] = DefaultBaseConfig[key] as never;
      }
    }

    return config as BaseConfig;
  }

  private validateNumberConfig(value: unknown): boolean {
    if (typeof value === 'number' && isNaN(value)) {
      return false;
    }
    return true;
  }
}

export type BaseConfig = typeof DefaultBaseConfig;
