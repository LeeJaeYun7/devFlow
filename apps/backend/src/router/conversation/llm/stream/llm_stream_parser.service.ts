import { Injectable } from '@nestjs/common';
import { OpenRouterService } from '../open_router/open_router.service';
import { OpenRouterRequestBody, OpenRouterStreamChunk } from '../open_router/open_router.type';
import { Parser, ParserService } from './parser';

@Injectable()
export class LlmStreamParserService {
  constructor(private readonly openRouterService: OpenRouterService) {}

  public async handleTitleStream(param: SendMessageParam) {
    await this.retryPolicy(param.retryStrategy, async () => {
      await this.createStream(param, (chunk: Buffer, parser: Parser) => {
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
    });
  }

  private async createStream(param: SendMessageParam, dataCb: (chunk: Buffer, parser: Parser) => void) {
    const promiseCb = async (resolve: () => void, reject: (error: unknown) => void) => {
      const stream = await this.openRouterService.chatStream({
        model: param.model,
        messages: param.messages,
        tools: param.tools,
      });

      const parser = ParserService.createInstance(param.parserCb);

      stream.data.on('data', (chunk: Buffer) => dataCb(chunk, parser));
      stream.data.on('error', reject);
      stream.data.on('end', async () => {
        try {
          await param.endCb?.();
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    };

    return new Promise<void>((resolve, reject) => promiseCb(resolve, reject));
  }

  public async handleMessageStream(param: SendMessageParam) {
    await this.retryPolicy(param.retryStrategy, async () => {
      let previousChunk: string | null = null;
      await this.createStream(param, (chunk: Buffer, parser: Parser) => {
        const dataList = this.toDataList(chunk);
        for (const data of dataList) {
          try {
            let combinedData: string = data;
            if (data[0] !== '{' && previousChunk !== null) {
              combinedData = previousChunk + data;
              previousChunk = null;
            }

            const parsed = JSON.parse(combinedData) as OpenRouterStreamChunk;
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              parser.write(content);
            }

            param.cb?.(parsed);
          } catch {
            if (data[data.length - 1] !== '}') {
              previousChunk = data;
            }
          }
        }
      });
    });
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

  private async retryPolicy(param: RetryPolicyParam | undefined, cb: () => Promise<void>) {
    let retryCount = 0;
    const maxRetryCount = param?.count ?? 1;
    const delayTime = param?.delay ?? 1000;

    while (retryCount++ < maxRetryCount) {
      try {
        await param?.retryInit?.();
        await cb();
        break;
      } catch (error) {
        if (retryCount >= maxRetryCount) {
          throw error;
        }

        if (delayTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayTime));
        }
      }
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

  /**
   * 스트림이 종료되었을 때 호출되는 콜백
   */
  endCb?: () => void | Promise<void>;

  /**
   * 스트림 오류 발생 시 재시도 전략
   */
  retryStrategy?: RetryPolicyParam;
}

interface RetryPolicyParam {
  retryInit?: () => Promise<void>;
  count: number;
  delay: number;
}
