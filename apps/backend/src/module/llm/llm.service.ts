import { Injectable, Logger } from '@nestjs/common';
import { LlmBasicService } from './basic.service';
import { FunctionCallingService } from './function_calling.service';
import { InjectModel } from '@nestjs/mongoose';
import { MessageModel } from '../mongo/model/message.model';
import { Model } from 'mongoose';
import { ChatCompletionMessageParam } from 'openai/resources';
import OpenAI from 'openai';
import { MessageRoleMap } from '@lia/api/message/message.constant';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageModel>,

    private readonly llmBasicService: LlmBasicService,
    private readonly functionCallingService: FunctionCallingService
  ) {}

  public async sendMessage(chatId: string, message: string) {
    const systemPrompt = await this.getSystemPrompt();
    const messages = await this.messageModel.find({ chatId }).sort({ createdAt: 1 });
    const promptMessages: ChatCompletionMessageParam[] = [
      { role: MessageRoleMap.system, content: systemPrompt },
      ...this.toPromptMessage(messages),
      { role: MessageRoleMap.user, content: message },
    ];
    const newMessageStartedIndex = promptMessages.length - 1;

    const response = await this.llmBasicService.chat(promptMessages, {
      tools: this.functionCallingService.getFunctionCallingList(),
    });

    promptMessages.push(response.choices[0].message);
    const functionCallingList = response.choices[0].message.tool_calls ?? [];
    const isFunctionCalling = functionCallingList.length > 0;

    if (!isFunctionCalling) {
      await this.messageModel.create(this.toMessages(promptMessages.slice(newMessageStartedIndex)));
      const firstContent = response.choices[0].message.content ?? '';
      return firstContent;
    }

    for (const functionCalling of functionCallingList) {
      const targetFunction = this.functionCallingService.getFunctionCallingMap()[functionCalling.function.name];
      if (!targetFunction) {
        this.logger.error(`Function calling ${functionCalling.function.name} not found`);
        continue;
      }

      const result = await targetFunction.execute(functionCalling.function.arguments);
      promptMessages.push({
        role: MessageRoleMap.tool,
        content: JSON.stringify(result),
        tool_call_id: functionCalling.id,
      });
    }

    const secondResponse = await this.llmBasicService.chat(promptMessages, {
      tools: this.functionCallingService.getFunctionCallingList(),
    });

    promptMessages.push(secondResponse.choices[0].message);
    await this.messageModel.create(this.toMessages(promptMessages.slice(newMessageStartedIndex)));

    const secondContent = secondResponse.choices[0].message.content ?? '';
    return secondContent;
  }

  private toPromptMessage(messages: MessageModel[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages.map((message) => {
      const baseMessage = {
        role: message.role,
        content: message.content,
      };

      if (message.role === MessageRoleMap.tool) {
        return {
          ...baseMessage,
          role: MessageRoleMap.tool,
          tool_call_id: message.toolCallId!,
        } as OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
      }

      if (message.role === MessageRoleMap.assistant && message.toolCalls) {
        return {
          ...baseMessage,
          role: MessageRoleMap.assistant,
          tool_calls: message.toolCalls,
        } as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam;
      }

      return baseMessage as OpenAI.Chat.Completions.ChatCompletionMessageParam;
    });
  }

  private toMessages(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    return messages.map((message) => {
      const role = message.role;

      if (role === MessageRoleMap.tool) {
        return {
          role,
          content: message.content,
          toolCallId: message.tool_call_id,
        };
      }

      return {
        role,
        content: message.content,
      };
    });
  }

  private async getSystemPrompt() {
    return `
    You are a helpful assistant that can answer questions and help with tasks.
    `;
  }
}
