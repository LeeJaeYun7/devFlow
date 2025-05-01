import OpenAI from 'openai';

export interface FunctionCalling {
  execute(args: any): Promise<any>;
  getToolDefinition(): OpenAI.Chat.Completions.ChatCompletionTool;
}
