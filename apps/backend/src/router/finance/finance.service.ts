import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { YahooFinanceFetcherService } from '../finance/fetchers/yahoo-finance-fetcher.service';
import NodeCache from 'node-cache';
import { TechnicalResponse } from '../finance/dto/technical-data.dto';
import { FundamentalResponse } from '../finance/dto/fundamental-data.dto';

@Injectable()
export class FinanceService implements OnModuleInit {
  private readonly logger = new Logger(FinanceService.name);
  private cache!: NodeCache;

  constructor(private readonly yahooFetcherService: YahooFinanceFetcherService) {}

  onModuleInit = () => {
    this.initializeCache();
  };

  private initializeCache = () => {
    if (!this.cache) {
      this.cache = new NodeCache({ stdTTL: 60 * 60 * 6 }); // 6시간 TTL
      this.logger.log('Cache initialized');
    }
  };

  public getTechnicalData = async (symbol: string): Promise<TechnicalResponse> => {
    this.initializeCache();

    const cacheKey = `technical-${symbol}`;
    const cachedData = this.cache.get<TechnicalResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

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

    this.cache.set(cacheKey, technicalData);
    return technicalData;
  };

  public getFundamentalData = async (symbol: string): Promise<FundamentalResponse> => {
    this.initializeCache();
    const cacheKey = `fundamental_${symbol}`;
    const cachedData = this.cache.get<FundamentalResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

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

    this.cache.set(cacheKey, fundamentalData);
    return fundamentalData;
  };
}
