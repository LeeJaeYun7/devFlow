import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { OpenRouterRequestBody } from './open_router.type';
import { Readable } from 'node:stream';
import { BaseConfigService } from '@lia/config';

@Injectable()
export class OpenRouterService {
  private readonly openRouterUrl: string;
  private readonly openRouterApiKey: string;
  private readonly model: string;
  private readonly temperature: number;
  private readonly logger = new Logger(OpenRouterService.name);

  constructor(private readonly configService: BaseConfigService) {
    const config = this.configService.getConfig();
    this.openRouterUrl = config.openRouter.url;
    this.openRouterApiKey = config.openRouter.apiKey;
    this.model = config.openRouter.model;
    this.temperature = config.openRouter.temperature;

    if (!this.openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }
    if (!this.model) {
      throw new Error('OPENROUTER_MODEL is not set');
    }
  }

  public async chatStream(body: OpenRouterRequestBody) {
    console.log('body print out');
    console.dir(body);

    try {
      return await axios.post<Readable>(
        this.openRouterUrl,
        {
          model: body.model ?? this.model,
          messages: body.messages,
          tools: body.tools,
          tool_choice: 'auto',
          temperature: this.temperature,
          stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        }
      );
    } catch (e) {
      if (e instanceof AxiosError) {
        this.logger.error(`LLM Error: ${e.response?.status} ${e.response?.statusText}`);
        this.logger.error(`LLM Error response data: ${JSON.stringify(e.response?.data)}`);
      } else {
        this.logger.error(e);
      }
      throw e;
    }
  }
}
