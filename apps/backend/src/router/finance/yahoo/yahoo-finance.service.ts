import { Injectable } from '@nestjs/common';
import { YahooTechnicalDto } from './dto/technical-data.dto';
import { YahooFundamentalDto } from './dto/fundamental-data.dto';
import { YahooStockService } from './yahoo-stock.service';

@Injectable()
export class YahooFinanceService {
  constructor(private readonly yahooStockService: YahooStockService) {}

  public getTechnicalData = async (symbol: string): Promise<YahooTechnicalDto> => {
    const stockQuote = await this.yahooStockService.getStockQuote(symbol);
    const ohlcvAndIndicators = await this.yahooStockService.getOhlcvAndIndicators(symbol);

    const technicalData: YahooTechnicalDto = {
      ohlcvAndIndicators,
      currentPrice: stockQuote.currentPrice ?? 0,
      changePercent: stockQuote.changePercent ?? 0,
      marketCap: stockQuote.marketCap ?? 0,
      high52Week: stockQuote.high52Week ?? 0,
      low52Week: stockQuote.low52Week ?? 0,
    };

    return technicalData;
  };

  public getFundamentalData = async (symbol: string): Promise<YahooFundamentalDto> => {
    const stockNews = await this.yahooStockService.getStockNews(symbol);
    const yahooMetrics = await this.yahooStockService.getFundamentalMetrics(symbol);
    const stockQuote = await this.yahooStockService.getStockQuote(symbol);

    const fundamentalData: YahooFundamentalDto = {
      currentPrice: stockQuote.currentPrice ?? 0,
      changePercent: stockQuote.changePercent ?? 0,
      peTrailing: yahooMetrics.pe_trailing,
      peForward: yahooMetrics.pe_forward,
      pbRatio: yahooMetrics.pb_ratio,
      roe: yahooMetrics.roe,
      eps: yahooMetrics.eps,
      dividendYield: yahooMetrics.dividend_yield,
      epsTrendOfNextQuarter: yahooMetrics.eps_trend_of_next_quarter,
      news: stockNews?.news ?? [],
    };

    return fundamentalData;
  };
}
