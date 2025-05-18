import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { 
  systemPrompt, 
  technicalAnalysisExamples, 
  fundamentalAnalysisExamples,
  AnalysisExample
} from 'libs/api/src/lia/lia-prompt-template.constant';
import { ConfigService } from '@nestjs/config';
import { tools } from 'libs/api/src/llm/tools/lia-tools.constant';
import { FinanceService } from '../../finance/finance.service';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly openRouterUrl: string;
  private readonly openRouterApiKey: string;
  private readonly model: string;
  private readonly temperature: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly financeService: FinanceService
  ) {
    this.openRouterUrl = this.configService.get<string>('OPENROUTER_URL') ?? 'https://api.openrouter.ai/api/v1/chat/completions';
    this.openRouterApiKey = this.configService.get<string>('OPENROUTER_API_KEY') ?? '';
    this.model = this.configService.get<string>('OPENROUTER_MODEL') ?? '';
    this.temperature = Number(this.configService.get<string>('OPENROUTER_TEMPERATURE')) || 0.7;

    if (!this.openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }
    if (!this.model) {
      throw new Error('OPENROUTER_MODEL is not set');
    }
  }

  private get openRouterHeaders() {
    return {
      Authorization: `Bearer ${this.openRouterApiKey}`,
      'Content-Type': 'application/json',
    };
  }

  public async getAnalysis(
    content: string,
    messages: any[]
  ): Promise<string> {
    const toolFunctions = {
      get_technical_data: async (args: any) => {
        return this.financeService.getTechnicalData(args.symbol);
      },
      get_fundamental_data: async (args: any) => {
        return this.financeService.getFundamentalData(args.symbol);
      },
    };

    const newMessages: any[] = [{ role: 'system', content: systemPrompt }];

    technicalAnalysisExamples.forEach((example: AnalysisExample) => {
      newMessages.push({ role: 'user', content: example.input });
      newMessages.push({ role: 'assistant', content: example.output });
    });

    fundamentalAnalysisExamples.forEach((example: AnalysisExample) => {
      newMessages.push({ role: 'user', content: example.input });
      newMessages.push({ role: 'assistant', content: example.output });
    });

    messages.forEach((message) => {
      if (
        (message.role === 'user' || message.role === 'assistant') && message.content && message.content !== '[function_call]'
      ) {
        newMessages.push({ role: message.role, content: message.content });
      }
    });

    newMessages.push({ role: 'user', content: content });

    // 1차 API 호출 (tool call 예측)
    const firstResponse = await axios.post(
      this.openRouterUrl,
      {
        model: this.model,
        messages: newMessages,
        tools,
        tool_choice: 'auto',
        temperature: this.temperature,
      },
      { headers: this.openRouterHeaders },
    );

    if (!firstResponse.data.choices || firstResponse.data.choices.length === 0) {
      throw new Error('OpenRouter API 응답에 choices가 없습니다. API 응답: ' + JSON.stringify(firstResponse.data));
    }

    const assistantMessage = firstResponse.data.choices[0].message;
    this.logger.log({ content, assistantMessage });

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      // 첫 번째 응답에서도 태그 제거
      return assistantMessage.content
        .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
        .replace(/<result>([\s\S]*?)<\/result>/g, '$1')
        .trim();
    }

    newMessages.push(assistantMessage);

    // Tool calls 처리
    for (const toolCall of assistantMessage.tool_calls) {
      const functionName = toolCall.function.name.toLowerCase() as keyof typeof toolFunctions;
      if (!toolFunctions[functionName]) continue;

      const args = JSON.parse(toolCall.function.arguments);
      this.logger.log({ content, toolCall: functionName, args });

      let toolResult = await toolFunctions[functionName](args);

      // Python dataclass처럼 필드 펼치기 (JS object 그대로라면 생략 가능)
      if (typeof toolResult === 'object' && toolResult !== null) {
        toolResult = { ...toolResult };
      }

      newMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: JSON.stringify(toolResult),
      });
    }

    // 2차 API 호출 (tool result 포함)
    const finalResponse = await axios.post(
      this.openRouterUrl,
      {
        model: this.model,
        messages: newMessages,
        tools,
        tool_choice: 'auto',
        temperature: this.temperature,
      },
      { headers: this.openRouterHeaders },
    );

    let finalResult = finalResponse.data.choices[0].message.content;
    this.logger.log({ content, finalResult });

    // <thinking> 태그와 <result> 태그 제거
    finalResult = finalResult
      .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
      .replace(/<result>([\s\S]*?)<\/result>/g, '$1')
      .trim();

    return finalResult;
  }
}
