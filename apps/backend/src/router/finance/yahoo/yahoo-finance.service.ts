import { Injectable, Logger } from '@nestjs/common';
import { YahooFinanceFetcherService } from './fetchers/yahoo-finance-fetcher.service';
import { TechnicalResponse } from './dto/technical-data.dto';
import { FundamentalResponse } from './dto/fundamental-data.dto';

@Injectable()
export class YahooFinanceService {
  private readonly logger = new Logger(YahooFinanceService.name);

  constructor(private readonly yahooFetcherService: YahooFinanceFetcherService) {}

  public getTechnicalData = async (symbol: string): Promise<TechnicalResponse> => {
    const quote = await this.yahooFetcherService.getQuote(symbol);
    const ohlcvAndIndicators = await this.yahooFetcherService.getOhlcvAndIndicators(symbol);

    const technicalData: TechnicalResponse = {
      ohlcvAndIndicators,
      currentPrice: quote.currentPrice,
      changePercent: quote.changePercent,
      marketCap: quote.marketCap,
      high52Week: quote.high52Week,
      low52Week: quote.low52Week,
    };

    return technicalData;
  };

  public getFundamentalData = async (symbol: string): Promise<FundamentalResponse> => {
    const news = await this.yahooFetcherService.getNews(symbol);
    const yahooMetrics = await this.yahooFetcherService.getFundamentalMetrics(symbol);
    const quote = await this.yahooFetcherService.getQuote(symbol);

    const fundamentalData: FundamentalResponse = {
      currentPrice: quote.currentPrice,
      changePercent: quote.changePercent,
      peTrailing: yahooMetrics.pe_trailing,
      peForward: yahooMetrics.pe_forward,
      pbRatio: yahooMetrics.pb_ratio,
      roe: yahooMetrics.roe,
      eps: yahooMetrics.eps,
      dividendYield: yahooMetrics.dividend_yield,
      epsTrendOfNextQuarter: yahooMetrics.eps_trend_of_next_quarter,
      news,
    };

    return fundamentalData;
  };
}
