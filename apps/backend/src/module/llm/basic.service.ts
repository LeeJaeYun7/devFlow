import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { ChatModel } from 'openai/resources/shared';

@Injectable()
export class LlmBasicService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  public async chat(messages: ChatCompletionMessageParam[], options: ChatOption = {}) {
    const response = await this.openai.chat.completions.create({
      model: options.model ?? 'gpt-3.5-turbo',
      messages,
      tools: options.tools,
      temperature: 0.7,
      top_p: 0.9,
    });

    return response;
  }

  public async streamChat(messages: ChatCompletionMessageParam[], options: ChatOption = {}) {
    const response = await this.openai.chat.completions.create({
      model: options.model ?? 'gpt-3.5-turbo',
      messages,
      tools: options.tools,
      temperature: 0.7,
      top_p: 0.9,
      stream: true,
    });

    return response;
  }
}

interface ChatOption {
  model?: ChatModel;
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
}
