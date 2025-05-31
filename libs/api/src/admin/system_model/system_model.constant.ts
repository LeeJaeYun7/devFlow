export const SystemModelTargetMap = {
  message: 'message',
  title: 'title',
} as const;

export const SystemModelTargetList = Object.values(SystemModelTargetMap);
export type SystemModelTarget = (typeof SystemModelTargetList)[number];

export const SystemModelList = [
  // OpenAI
  'openai/gpt-3.5-turbo',
  'openai/gpt-3.5-turbo-0125',
  'openai/gpt-4',
  'openai/gpt-4-0314',
  'openai/gpt-4-0613',
  'openai/gpt-4-1106-preview',
  'openai/gpt-4-0125-preview',
  'openai/gpt-4-turbo',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'openai/o4-mini',
  'openai/gpt-4.1-mini',
  'openai/gpt-4.1-nano',
  'openai/gpt-4.1',

  // Google
  'google/gemini-pro',
  'google/gemini-pro-vision',
  'google/gemma-2b-it',
  'google/gemini-2.0-flash-001',
  'google/gemini-2.5-pro-preview',

  // Anthropic
  'anthropic/claude-sonnet-4',
  'anthropic/claude-3.7-sonnet',
  'anthropic/claude-3-opus',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-3-haiku',

  // Meta
  'meta/llama-2-7b-chat',
  'meta/llama-2-13b-chat',
  'meta/llama-2-70b-chat',
  'meta/llama-3-8b-instruct',
  'meta/llama-3-70b-instruct',
] as const;

export type SystemModel = (typeof SystemModelList)[number];
