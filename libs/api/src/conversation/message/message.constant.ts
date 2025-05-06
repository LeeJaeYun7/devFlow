export const MessageRoleMap = {
  user: 'user',
  assistant: 'assistant',
  system: 'system',
  tool: 'tool',
} as const;

export const MessageRoleList = Object.values(MessageRoleMap);
export type MessageRole = (typeof MessageRoleList)[number];
