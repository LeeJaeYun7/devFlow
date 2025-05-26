import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { OpenRouterRequestBody, OpenRouterResponseBody } from './open_router.type';
import { Readable } from 'node:stream';

@Injectable()
export class OpenRouterService {
  private readonly openRouterUrl: string;
  private readonly openRouterApiKey: string;
  private readonly model: string;
  private readonly temperature: number;
  private readonly logger = new Logger(OpenRouterService.name);

  constructor(private readonly configService: ConfigService) {
    this.openRouterUrl =
      this.configService.get<string>('OPENROUTER_URL') ?? 'https://api.openrouter.ai/api/v1/chat/completions';
    this.openRouterApiKey = this.configService.get<string>('OPENROUTER_API_KEY') ?? '';
    this.model = this.configService.get<string>('OPENROUTER_MODEL') ?? '';
    this.temperature = Number(this.configService.get<string>('OPENROUTER_TEMPERATURE')) || 0.7;

    if (!this.openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }
    if (!this.model) {
      throw new Error('OPENROUTER_MODEL is not set');
    }
  }

  public async chat(body: OpenRouterRequestBody) {
    return await axios.post<OpenRouterResponseBody>(
      this.openRouterUrl,
      {
        model: this.model,
        messages: body.messages,
        tools: body.tools,
        tool_choice: 'auto',
        temperature: this.temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  public async chatStream(body: OpenRouterRequestBody) {
    try {
      return await axios.post<Readable>(
        this.openRouterUrl,
        {
          model: this.model,
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
        this.logger.error(`LLM Error: ${e.response?.status} ${e.response?.statusText} ${e.response?.data}`);
      } else {
        this.logger.error(e);
      }
      throw e;
    }
  }
}
