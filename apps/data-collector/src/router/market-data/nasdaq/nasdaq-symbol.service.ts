import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import yahooFinance from 'yahoo-finance2';
import { NasdaqStockSymbol } from '../../../module/mongo/model/nasdaq/models/nasdaq-stock-symbol.model';

@Injectable()
export class NasdaqSymbolService {
  private readonly logger = new Logger(NasdaqSymbolService.name);

  constructor(
    @InjectModel(NasdaqStockSymbol.name)
    private readonly stockSymbolModel: Model<NasdaqStockSymbol>
  ) {}

  public async fetchAndStoreTopSymbols(): Promise<void> {
    try {
      const allSymbols: string[] = [];

      // 여러 스크리너에서 종목 수집
      const screeners = [
        'most_actives',
        'undervalued_large_caps',
        'growth_technology_stocks',
        'portfolio_anchors',
        'solid_large_growth_funds',
        'day_gainers',
        'day_losers',
        'undervalued_growth_stocks',
        'aggressive_small_caps',
        'small_cap_gainers',
      ] as const;

      for (const screener of screeners) {
        this.logger.log(`Fetching symbols from ${screener} screener...`);

        try {
          const result = await yahooFinance.screener({
            scrIds: screener,
            count: 200, // 각 스크리너에서 200개씩 가져오기
          });

          const symbols = result.quotes.map((q: { symbol: string }) => q.symbol);
          allSymbols.push(...symbols);

          this.logger.log(`Fetched ${symbols.length} symbols from ${screener}`);
          await new Promise((res) => setTimeout(res, 1000)); // API 제한을 피하기 위한 딜레이
        } catch (error) {
          this.logger.warn(`Failed to fetch from ${screener}: ${error instanceof Error ? error.message : String(error)}`);
          continue; // 한 스크리너가 실패해도 계속 진행
        }
      }

      const uniqueSymbols = Array.from(new Set(allSymbols.map((s) => s.trim().toUpperCase())));

      for (const symbol of uniqueSymbols) {
        await this.stockSymbolModel.updateOne({ symbol }, { symbol }, { upsert: true });
      }

      this.logger.log(`Successfully stored ${uniqueSymbols.length} unique symbols from Yahoo Finance.`);
    } catch (err: unknown) {
      this.logger.error(
        `Failed to fetch symbols from Yahoo Finance: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
