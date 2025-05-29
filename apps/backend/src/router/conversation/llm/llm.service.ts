import { Injectable } from '@nestjs/common';
import { tools } from './open_router/lia-tools.constant';
import { YahooFinanceService } from '../../finance/yahoo/yahoo-finance.service';
import { NaverFinanceService } from '../../finance/naver/naver-finance.service';
import { OpenRouterService } from './open_router/open_router.service';
import {
  OpenRouterMessage,
  OpenRouterStreamChunk,
  OpenRouterStreamChunkToolCall,
} from './open_router/open_router.type';
import { InjectModel } from '@nestjs/mongoose';
import { MessageModel } from '../../../module/mongo/model/conversation/models/message.model';
import { Model } from 'mongoose';
import { MessageRoleMap } from '@lia/api/conversation/message/message.constant';
import { systemPrompt } from './example.constant';
import { ParserService } from './parser.service';
@Injectable()
export class LlmService {
  constructor(
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageModel>,
    private readonly yahooFinanceService: YahooFinanceService,
    private readonly naverFinanceService: NaverFinanceService,
    private readonly openRouterService: OpenRouterService,
    private readonly parserService: ParserService
  ) {}

  public async getTitleStream({ message, cb, endCb }: LLMStreamParam) {
    const res = await this.openRouterService.chatStream({
      messages: [
        {
          role: 'system',
          content: systemPromptForTitle,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'openai/gpt-3.5-turbo',
    });
    const stream = res.data;
    let title = '';
    let lastSentTitle = '';

    stream.on('data', (chunk: Buffer) => {
      const dataList = this.toDataList(chunk);
      for (const data of dataList) {
        try {
          const parsed = JSON.parse(data) as OpenRouterStreamChunk;
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            title += content;
            // 누적된 제목이 이전에 보낸 제목과 다를 때만 전송
            if (title !== lastSentTitle) {
              lastSentTitle = title;
              cb(title);
            }
          }
        } catch {
          // ignore
        }
      }
    });

    stream.on('end', () => {
      if (title && title !== lastSentTitle) {
        cb(title);
      }
      if (title) {
        endCb?.(title);
      }
    });
  }

  private isKoreanStock(symbol: string): boolean {
    // Check if symbol is 5-6 digit number or ends with .KS/.KQ
    return /^\d{5,6}$/.test(symbol) || /\.(KS|KQ)$/.test(symbol);
  }

  public async getAnalysisStream({ chatId, message, cb, endCb, titleParam }: LLMAnalysisStreamParam) {
    const toolFunctions = {
      get_technical_data: async (args: any) => {
        const symbol = args.symbol;
        if (this.isKoreanStock(symbol)) {
          const cleanSymbol = symbol.replace(/\.(KS|KQ)$/, '');
          return this.naverFinanceService.getTechnicalData(cleanSymbol);
        } else {
          return this.yahooFinanceService.getTechnicalData(symbol);
        }
      },
      get_fundamental_data: async (args: any) => {
        const symbol = args.symbol;
        if (this.isKoreanStock(symbol)) {
          const cleanSymbol = symbol.replace(/\.(KS|KQ)$/, '');
          return this.naverFinanceService.getFundamentalData(cleanSymbol);
        } else {
          return this.yahooFinanceService.getFundamentalData(symbol);
        }
      },
    };

    const messages = await this.messageModel.find({
      chatId,
      role: { $in: [MessageRoleMap.user, MessageRoleMap.assistant] },
      content: { $ne: '[function_call]' },
    });

    if (messages.length === 0) {
      await this.getTitleStream({
        message,
        cb: titleParam?.cb,
        endCb: titleParam?.endCb,
      });
    }

    const newMessages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((v) => ({ role: v.role, content: v.content })),
      { role: 'user', content: message },
    ];
    const newMessageStartIndex = newMessages.length - 1;

    const postProcess = async () => {
      const createNewMessages = newMessages.slice(newMessageStartIndex);
      await this.messageModel.insertMany(
        createNewMessages
          .map((v, i) => ({
            chatId,
            content: v.content,
            role: v.role,
            tool_calls: v.tool_calls?.map((v) => ({
              id: v.id,
              index: v.index,
              type: v.type,
              function: v.function,
            })),
            createdAt: new Date(Date.now() + i),
          }))
          .filter((v) => v.content)
      );
    };

    const firstResponseStream = await this.openRouterService.chatStream({
      messages: newMessages,
      tools,
    });

    let finalContent = '';
    let isToolCall = false;

    const firstStreamParser = this.parserService.createParser((content) => {
      if (isToolCall) {
        return;
      }
      finalContent += content;
      cb(content);
    });

    const firstStream = firstResponseStream.data;
    const firstResponseTools: OpenRouterStreamChunkToolCall[] = [];

    firstStream.on('data', (chunk: Buffer) => {
      const dataList = this.toDataList(chunk);
      for (const data of dataList) {
        try {
          const parsed = JSON.parse(data) as OpenRouterStreamChunk;
          const delta = parsed.choices[0]?.delta;
          const content = delta?.content;

          const toolCalls = delta?.tool_calls;
          if (toolCalls) {
            isToolCall = true;
            for (const toolCall of toolCalls) {
              const index = toolCall.index;
              if (index >= firstResponseTools.length) {
                firstResponseTools.push({
                  id: toolCall.id,
                  index,
                  type: 'function',
                  function: { name: toolCall.function.name, arguments: toolCall.function.arguments },
                });
              } else {
                const targetToolCall = firstResponseTools[index];
                if (!targetToolCall.function.name) {
                  targetToolCall.function.name = toolCall.function.name;
                }
                targetToolCall.function.arguments += toolCall.function.arguments ?? '';
              }
            }
            continue;
          }

          if (!content) {
            continue;
          }

          firstStreamParser.write(content);
        } catch {
          // ignore
        }
      }
    });

    firstStream.on('end', async () => {
      if (!isToolCall) {
        endCb?.(finalContent);
        newMessages.push({
          role: 'assistant',
          content: finalContent,
        });
        await postProcess();
        return;
      }

      finalContent = '';

      newMessages.push({
        role: 'assistant',
        content: null,
        tool_calls: firstResponseTools,
      });
      for (const toolCall of firstResponseTools) {
        const functionName = toolCall.function.name.toLowerCase() as keyof typeof toolFunctions;
        if (!toolFunctions[functionName]) continue;

        const args = JSON.parse(toolCall.function.arguments);
        const func = toolFunctions[functionName];
        const toolResult = await func(args);

        newMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(toolResult),
        });
      }

      const secondResponseStream = await this.openRouterService.chatStream({
        messages: newMessages,
        tools,
      });
      const secondStreamParser = this.parserService.createParser((content) => {
        finalContent += content;
        cb(content);
      });

      const secondStream = secondResponseStream.data;
      secondStream.on('data', (chunk: Buffer) => {
        const dataList = this.toDataList(chunk);
        for (const data of dataList) {
          try {
            const parsed = JSON.parse(data) as OpenRouterStreamChunk;
            const delta = parsed.choices[0]?.delta;
            const content = delta?.content;
            if (!content) {
              continue;
            }
            secondStreamParser.write(content);
          } catch {
            // ignore
          }
        }
      });

      secondStream.on('end', async () => {
        endCb?.(finalContent);
        newMessages.push({
          role: 'assistant',
          content: finalContent,
        });
        postProcess();
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
}

const systemPromptForTitle = `This is a stock recommendation service.
Generate a title based on the user’s question.
• The title must be within 10 characters.
• Detect the language of the user’s question accurately and conservatively.
• Only use Japanese if the input is clearly in Japanese.
• Respond in the same language.
• Respond with the title only – no explanations or extra text.`;

interface LLMStreamParam {
  message: string;
  cb: (content: string) => void;
  endCb?: (finalContent: string) => Promise<void>;
}

interface LLMAnalysisStreamParam extends LLMStreamParam {
  chatId: string;
  titleParam: Omit<LLMStreamParam, 'message'>;
}
