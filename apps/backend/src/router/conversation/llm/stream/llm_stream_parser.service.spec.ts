import EventEmitter from 'node:events';
import { OpenRouterService } from '../open_router/open_router.service';
import { OpenRouterStreamChunk, OpenRouterStreamChunkToolCall } from '../open_router/open_router.type';
import { LlmStreamParserService } from './llm_stream_parser.service';

describe('LlmStreamParserService', () => {
  let finalContent = '';
  let isToolCall = false;
  const firstResponseTools: OpenRouterStreamChunkToolCall[] = [];

  const firstStreamParser = (content: string) => {
    if (!isToolCall) {
      finalContent += content;
    }
  };

  const firstStreamCb = (chunk: OpenRouterStreamChunk) => {
    const toolCalls = chunk.choices[0]?.delta?.tool_calls;
    if (!toolCalls) {
      return;
    }
    isToolCall = true;
    for (const toolCall of toolCalls) {
      const index = toolCall.index;
      if (index >= firstResponseTools.length) {
        firstResponseTools.push({
          id: toolCall.id,
          index,
          type: 'function',
          function: {
            name: toolCall.function.name,
            arguments: toolCall.function.arguments,
          },
        });
      } else {
        const targetToolCall = firstResponseTools[index];
        targetToolCall.function.arguments += toolCall.function.arguments ?? '';
      }
    }
  };

  beforeEach(() => {
    finalContent = '';
    isToolCall = false;
    firstResponseTools.length = 0;
  });

  it('divideChunkTestCase1 test', async () => {
    const service = getService(divideChunkTestCase1);
    await service.handleMessageStream({
      model: 'openai/gpt-3.5-turbo',
      messages: [],
      tools: [],
      parserCb: firstStreamParser,
      cb: firstStreamCb,
      endCb: () => {
        expect(firstResponseTools.length).toBe(2);

        expect(firstResponseTools[0].index).toBe(0);
        expect(firstResponseTools[1].index).toBe(1);

        const firstArg = JSON.parse(firstResponseTools[0].function.arguments);
        const secondArg = JSON.parse(firstResponseTools[1].function.arguments);

        expect(firstArg.symbol).toBe('BA');
        expect(secondArg.symbol).toBe('BA');

        expect(firstResponseTools[0].function.name).toBe('get_fundamental_data');
        expect(firstResponseTools[1].function.name).toBe('get_technical_data');

        expect(finalContent.trim()).toBe('');
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 800));
  });
});

function getService(chunkList: string[]) {
  const mockOpenRouterService = {
    chatStream: () => {
      const event = new EventEmitter();

      setTimeout(async () => {
        for (const chunk of chunkList) {
          event.emit('data', Buffer.from(chunk));
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        event.emit('end');
      }, 500);

      return { data: event };
    },
  } as unknown as OpenRouterService;

  return new LlmStreamParserService(mockOpenRouterService);
}

/**
 * Chunk가 나눠져서 오는 케이스
 */
const divideChunkTestCase1 = `: OPENROUTER PROCESSING

: OPENROUTER PROCESSING

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":null,"tool_calls":[{"index":0,"id":"call_EkEAi8FSp8St8OBEmE8pZDuC","type":"function","function":{"name":"get_fundamental_data","arguments":""}}]},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":null,"tool_calls":[{"index":0,"function":{"arguments":"{\\"sy"},"type":"function"}]},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":174921

9238,"choices":[{"index":0,"delta":{"role":"assistant","content":null,"tool_calls":[{"index":0,"function":{"arguments":"mbol\\""},"type":"function"}]},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":null,"tool_calls":[{"index":0,"function":{"arguments":": \\"BA\\""},"type":"function"}]},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}



data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":null,"tool_calls":[{"index":0,"function":{"arguments":"}"},"type":"function"}]},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":null,"tool_calls":[{"index":1,"id":"call_mEZcwRPJioaEcYAbsgOBrCIY","type":"function","function":{"name":"get_technical_data","arguments":""}}]},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":null,"tool_calls":[{"index":1,"function":{"arguments":"{\\"sy"},"type":"function"}]},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion

.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":null,"tool_calls":[{"index":1,"function":{"arguments":"mbol\\""},"type":"function"}]},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":null,"tool_calls":[{"index":1,"function":{"arguments":": \\"BA\\""},"type":"function"}]},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}



data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":null,"tool_calls":[{"index":1,"function":{"arguments":"}"},"type":"function"}]},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"system_fingerprint":null}

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":"tool_calls","native_finish_reason":"tool_calls","logprobs":null}],"system_fingerprint":null}

data: {"id":"gen-1749219238-Pkt4o3WYqyikRFSukVVd","provider":"OpenAI","model":"openai/gpt-3.5-turbo","object":"chat.completion.chunk","created":1749219238,"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null,"native_finish_reason":null,"logprobs":null}],"usage":{"prompt_tokens":1459,"completion_tokens":49,"total_tokens":1508,"prompt_tokens_details":{"cached_tokens":0},"completion_tokens_details":{"reasoning_tokens":0}}}

data: [DONE]`
  .split('\n')
  .filter((v) => v);
