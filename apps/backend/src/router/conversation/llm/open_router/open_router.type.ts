export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_call_id?: string;
  tool_calls?: OpenRouterToolCall[];
  name?: string;
}

interface OpenRouterToolCall {
  id: string;
  index: number;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
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
  model?: string;
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
  delta: OpenRouterStreamChunkDelta;
  finish_reason?: string | null;
  native_finish_reason?: string | null;
  logprobs?: any;
}

interface OpenRouterStreamChunkDelta {
  role: 'assistant';
  content: string;
  tool_calls?: OpenRouterStreamChunkToolCall[];
}

export interface OpenRouterStreamChunkToolCall {
  id: string;
  index: number;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}
