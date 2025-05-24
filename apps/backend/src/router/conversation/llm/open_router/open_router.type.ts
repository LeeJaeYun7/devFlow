export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

interface OpenRouterFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface OpenRouterTool {
  type: 'function';
  function: OpenRouterFunction;
}

export interface OpenRouterRequestBody {
  messages: OpenRouterMessage[];
  tools?: OpenRouterTool[];
}

/*
 * Response Body 정의
 */

interface OpenRouterResponseToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenRouterResponseMessage {
  role: 'assistant';
  content: string;
  tool_calls?: OpenRouterResponseToolCall[];
}

interface OpenRouterResponseChoice {
  message: OpenRouterResponseMessage;
}

export interface OpenRouterResponseBody {
  choices: OpenRouterResponseChoice[];
}

// Stream Response Body 정의

export interface OpenRouterStreamChunk {
  id: string;
  provider: string;
  model: string;
  object: string;
  created: number;
  choices: OpenRouterStreamChunkChoice[];
}

interface OpenRouterStreamChunkChoice {
  index: number;
  delta: OpenRouterResponseMessage;
  finish_reason?: string | null;
  native_finish_reason?: string | null;
  logprobs?: any;
}
