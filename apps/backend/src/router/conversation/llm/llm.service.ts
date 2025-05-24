import { Injectable, Logger } from '@nestjs/common';
import { tools } from './open_router/lia-tools.constant';

import { YahooFinanceService } from '../../finance/yahoo/yahoo-finance.service';
import { OpenRouterService } from './open_router/open_router.service';
import { OpenRouterMessage, OpenRouterStreamChunk } from './open_router/open_router.type';
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private readonly yahooFinanceService: YahooFinanceService,
    private readonly openRouterService: OpenRouterService
  ) {}

  public async getTitleStream(
    message: string,
    cb: (content: string) => void,
    endCb: (finalTitle: string) => Promise<void>
  ) {
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
    });
    const stream = res.data;
    let title = '';
    let lastSentTitle = '';

    stream.on('data', (chunk: Buffer) => {
      const chunkString = chunk.toString();
      const data = chunkString.split('data: ')[1];

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
    });

    stream.on('end', () => {
      console.log('final title', title);
      if (title && title !== lastSentTitle) {
        cb(title);
      }
      if (title) {
        endCb(title);
      }
    });
  }

  public async getAnalysis(content: string, messages: any[]): Promise<string> {
    const toolFunctions = {
      get_technical_data: async (args: any) => {
        return this.yahooFinanceService.getTechnicalData(args.symbol);
      },
      get_fundamental_data: async (args: any) => {
        return this.yahooFinanceService.getFundamentalData(args.symbol);
      },
    };

    const newMessages: OpenRouterMessage[] = [{ role: 'system', content: systemPrompt }];

    /* technicalAnalysisExamples.forEach((example: AnalysisExample) => {
      newMessages.push({ role: 'user', content: example.input });
      newMessages.push({ role: 'assistant', content: example.output });
    });

    fundamentalAnalysisExamples.forEach((example: AnalysisExample) => {
      newMessages.push({ role: 'user', content: example.input });
      newMessages.push({ role: 'assistant', content: example.output });
    });
    */
    messages.forEach((message) => {
      if (
        (message.role === 'user' || message.role === 'assistant') &&
        message.content &&
        message.content !== '[function_call]'
      ) {
        newMessages.push({ role: message.role, content: message.content });
      }
    });

    newMessages.push({ role: 'user', content: content });

    // 1차 API 호출 (tool call 예측)
    const firstResponse = await this.openRouterService.chat({
      messages: newMessages,
      tools,
    });

    if (!firstResponse.data.choices || firstResponse.data.choices.length === 0) {
      throw new Error('OpenRouter API 응답에 choices가 없습니다. API 응답: ' + JSON.stringify(firstResponse.data));
    }

    const assistantMessage = firstResponse.data.choices[0].message;
    this.logger.log({ content, assistantMessage });

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return this.removeThinkingAndResultTags(assistantMessage.content);
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
    const finalResponse = await this.openRouterService.chat({
      messages: newMessages,
      tools,
    });

    const finalResult = finalResponse.data.choices[0].message.content;
    this.logger.log({ content, finalResult });

    return this.removeThinkingAndResultTags(finalResult);
  }

  // <thinking> 태그와 <result> 태그 제거
  private removeThinkingAndResultTags(content: string) {
    return content
      .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
      .replace(/<result>([\s\S]*?)<\/result>/g, '$1')
      .trim();
  }
}

const systemPrompt = `당신은 금융 분석 전문가입니다. 사용자의 질문에 대해 기술적 분석과 기본적 분석을 제공합니다.

기술적 분석은 주가, 거래량, 이동평균선 등의 차트 데이터를 기반으로 합니다.
기본적 분석은 재무제표, 실적, 뉴스 등의 데이터를 기반으로 합니다.

분석 시 다음 도구들을 사용할 수 있습니다:
1. get_technical_data: 기술적 분석 데이터 조회
2. get_fundamental_data: 기본적 분석 데이터 조회

중요: 주가 상승/하락 원인을 분석할 때는 반드시 get_technical_data와 get_fundamental_data를 동시에 호출해야 합니다.
두 함수를 순차적으로 호출하지 말고, 한 번의 tool_calls에 두 함수를 모두 포함시켜야 합니다.

응답 형식:
1. 기술적 분석
2. 기본적 분석
3. 종합 분석 및 투자 제안

주의사항:
- 답변은 한국어로 작성해주세요.
- 사용자의 대화 히스토리는 참고용입니다.
- Tool Call 및 응답 생성 시에는 반드시 가장 마지막 사용자의 질문을 기준으로 분석하고 응답하세요.
`;

const systemPromptForTitle = `
이 서비스는 주식 추천 서비스야. 사용자 질문에 대해서 너는 제목을 만들어야 해.
응답은 제목만 보내주면 되고, 10글자 내외로 만들어줘.
언어는 사용자의 질문에 맞는 언어로 해줘
`;
