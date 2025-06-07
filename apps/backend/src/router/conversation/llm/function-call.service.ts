import { Injectable } from '@nestjs/common';
import { YahooFinanceService } from '../../finance/yahoo/yahoo-finance.service';
import { NaverFinanceService } from '../../finance/korea/naver/naver-finance.service';
import { DartFinanceService } from '../../finance/korea/dart/dart-finance.service';
import { OpenRouterStreamChunkToolCall } from './open_router/open_router.type';

@Injectable()
export class FunctionCallService {
  constructor(
    private readonly yahooFinanceService: YahooFinanceService,
    private readonly naverFinanceService: NaverFinanceService,
    private readonly dartFinanceService: DartFinanceService,
  ) {}

  public getToolFunctions(): Record<string, (args: Args) => Promise<any>> {
    return {
      get_technical_data: async (args: Args) => {
        const symbol = args.symbol;
        if (this.isKoreanStock(symbol)) {
          const koreanSymbol = symbol.replace(/\.(KS|KQ)$/, '');
          return this.naverFinanceService.getTechnicalData(koreanSymbol);
        } else {
          const usaSymbol = symbol.replace(/\./g, '-');
          return this.yahooFinanceService.getTechnicalData(usaSymbol);
        }
      },
      get_fundamental_data: async (args: Args) => {
        const symbol = args.symbol;
        if (this.isKoreanStock(symbol)) {
          const koreanSymbol = symbol.replace(/\.(KS|KQ)$/, '');

          // Naver와 Dart 동시에 호출!
          const [naverData, dartData] = await Promise.all([
            this.naverFinanceService.getFundamentalData(koreanSymbol),
            this.dartFinanceService.getFundamentalData(koreanSymbol),
          ]);

          return {
            naver: naverData,
            dart: dartData,
          };
        } else {
          const usaSymbol = symbol.replace(/\./g, '-');
          return this.yahooFinanceService.getFundamentalData(usaSymbol);
        }
      },
    };
  }

  private isKoreanStock(symbol: string): boolean {
    return /^\d{5,6}$/.test(symbol) || /\.(KS|KQ)$/.test(symbol);
  }

  /**
   * 단일 toolCall 처리 메서드
   */
  public async processFunctionCall(toolCall: OpenRouterStreamChunkToolCall): Promise<any> {
    const toolFunctions = this.getToolFunctions();
    const functionName = toolCall.function.name.toLowerCase() as keyof typeof toolFunctions;

    if (!toolFunctions[functionName]) {
      throw new Error(`Unsupported function: ${functionName}`);
    }

    const jsonStr = toolCall.function.arguments?.trim() ?? '';
    if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
      throw new Error(`Invalid JSON format for ${functionName}: ${jsonStr}`);
    }

    if (!jsonStr.includes('"symbol"') && !jsonStr.includes('symbol:')) {
      throw new Error(`Missing 'symbol' key in JSON for ${functionName}: ${jsonStr}`);
    }

    let args: Args;
    try {
      args = JSON.parse(jsonStr);
      if (!args.symbol || typeof args.symbol !== 'string' || args.symbol.length === 0) {
        throw new Error(`Invalid 'symbol' value: ${args.symbol}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Failed to parse JSON for ${functionName}: ${jsonStr}`);
      }
      throw e;
    }

    try {
      const toolResult = await toolFunctions[functionName](args);
      return toolResult;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Error executing ${functionName}: ${e.message}`);
      }
      throw e;
    }
  }
}

type Args = Record<string, any>;
