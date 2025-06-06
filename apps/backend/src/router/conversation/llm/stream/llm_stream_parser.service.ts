import { Injectable } from '@nestjs/common';
import { OpenRouterService } from '../open_router/open_router.service';
import { OpenRouterRequestBody, OpenRouterStreamChunk } from '../open_router/open_router.type';
import { ParserService } from './parser';

@Injectable()
export class LlmStreamParserService {
  constructor(private readonly openRouterService: OpenRouterService) {}

  public async createTitleStream(param: SendMessageParam) {
    const stream = await this.openRouterService.chatStream({
      model: param.model,
      messages: param.messages,
    });

    const parser = ParserService.createInstance(param.parserCb);

    stream.data.on('data', (chunk: Buffer) => {
      const dataList = this.toDataList(chunk);
      for (const data of dataList) {
        try {
          const parsed = JSON.parse(data) as OpenRouterStreamChunk;
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            parser.write(content);
          }

          param.cb?.(parsed);
        } catch {
          // ignore
        }
      }
    });

    return stream.data;
  }

  public async createStream(param: SendMessageParam) {
    const stream = await this.openRouterService.chatStream({
      model: param.model,
      messages: param.messages,
      tools: param.tools,
    });

    const parser = ParserService.createInstance(param.parserCb);

    stream.data.on('data', (chunk: Buffer) => {
      const dataList = this.toDataList(chunk);
      for (const data of dataList) {
        try {
          const parsed = JSON.parse(data) as OpenRouterStreamChunk;
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            parser.write(content);
          }

          param.cb?.(parsed);
        } catch {
          // ignore
        }
      }
    });

    return stream.data;
  }

  private toDataList(chunk: Buffer): string[] {
    try {
      const chunkString = chunk.toString();
      return chunkString
        .split('data: ')
        .map((data) => data.trim())
        .filter((v) => v && v !== ': OPENROUTER PROCESSING' && v !== '[DONE]');
    } catch {
      return [];
    }
  }
}

interface SendMessageParam extends OpenRouterRequestBody {
  /**
   * Stream에서 받는 파서에 대한 콜백
   * <thinking>, <result>와 같은 태그는 무시
   */
  parserCb: (content: string) => void;

  /**
   * 최종 결과물에 대한 콜백
   * Promise를 반환해야 하면 추후에 리펙토링을 통해 .on을 안정적으로 수행할 수 있도록 해야함.
   */
  cb?: (chunk: OpenRouterStreamChunk) => void;
}
