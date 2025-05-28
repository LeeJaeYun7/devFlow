import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dayjs from 'dayjs';
import { YahooStockInfo } from '../../../module/mongo/model/yahoo/models/yahoo-stock-info.model';
import { YahooStockHistory } from '../../../module/mongo/model/yahoo/models/yahoo-stock-history.model';
import { YahooStockAnalysis } from '../../../module/mongo/model/yahoo/models/yahoo-stock-analysis.model';
import { YahooStockNews } from '../../../module/mongo/model/yahoo/models/yahoo-stock-news.model';
import { YahooStockQuote } from '../../../module/mongo/model/yahoo/interfaces/yahoo-stock-quote.interface';

@Injectable()
export class YahooStockService {
  private readonly logger = new Logger(YahooStockService.name);

  constructor(
    @InjectModel(YahooStockInfo.name) private readonly stockInfoModel: Model<YahooStockInfo>,
    @InjectModel(YahooStockHistory.name) private readonly stockHistoryModel: Model<YahooStockHistory>,
    @InjectModel(YahooStockAnalysis.name) private readonly stockAnalysisModel: Model<YahooStockAnalysis>,
    @InjectModel(YahooStockNews.name) private readonly stockNewsModel: Model<YahooStockNews>
  ) {}

  async getStockInfo(symbol: string): Promise<YahooStockInfo | null> {
    try {
      return await this.stockInfoModel.findOne({ symbol }).exec();
    } catch (error: unknown) {
      this.logger.error(`Error getting stock info for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getStockQuote(symbol: string): Promise<YahooStockQuote> {
    try {
      const stockInfo = await this.stockInfoModel.findOne({ symbol }).exec();

      return {
        currentPrice: stockInfo?.summaryDetail?.regularMarketOpen ?? null,
        changePercent: stockInfo?.summaryDetail?.regularMarketChangePercent ?? null,
        marketCap: stockInfo?.summaryDetail?.marketCap ?? null,
        high52Week: stockInfo?.summaryDetail?.fiftyTwoWeekHigh ?? null,
        low52Week: stockInfo?.summaryDetail?.fiftyTwoWeekLow ?? null,
      };
    } catch (error: unknown) {
      this.logger.error(`Error getting stock info for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getStockHistory(symbol: string, interval: string): Promise<YahooStockHistory | null> {
    try {
      return await this.stockHistoryModel.findOne({ symbol, interval }).exec();
    } catch (error: unknown) {
      this.logger.error(`Error getting stock history for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  public async getOhlcvAndIndicators(symbol: string): Promise<Record<string, any>> {
    const history = await this.getStockHistory(symbol, '1d');
    if (!history || !history.data) return {};

    const df = history.data.map((item) => ({
      date: dayjs(item.date).format('YYYY-MM-DD'),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));

    // Technical indicators 계산 (RSI, MA, MACD, BollingerBands 등은 직접 구현 필요)
    // -> 생략하고 필요한 경우 finance-indicators 패키지 등을 활용 가능

    // 임시로 OHLCV만 리턴
    const result = df.reduce(
      (
        acc: Record<string, any>,
        cur: { date: string; open: number; high: number; low: number; close: number; volume: number }
      ) => {
        acc[cur.date] = {
          open: cur.open,
          high: cur.high,
          low: cur.low,
          close: cur.close,
          volume: cur.volume,
          // 여기에 ma_5, ma_20, ma_60, rsi_14, macd, macd_signal, bollinger_upper, bollinger_lower 등 추가 가능
        };
        return acc;
      },
      {} as Record<string, any>
    );

    return result;
  }

  async getStockAnalysis(symbol: string): Promise<YahooStockAnalysis | null> {
    try {
      return await this.stockAnalysisModel.findOne({ symbol }).exec();
    } catch (error: unknown) {
      this.logger.error(`Error getting stock analysis for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getStockNews(symbol: string): Promise<YahooStockNews | null> {
    try {
      return await this.stockNewsModel.findOne({ symbol }).exec();
    } catch (error: unknown) {
      this.logger.error(`Error getting stock news for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  public async getFundamentalMetrics(symbol: string): Promise<any> {
    const stockInfo = await this.getStockInfo(symbol);
    const epsTrend = await this.getEpsTrend(symbol);

    return {
      pe_trailing: stockInfo?.summaryDetail?.trailingPE,
      pe_forward: stockInfo?.summaryDetail?.forwardPE,
      pb_ratio: stockInfo?.defaultKeyStatistics?.priceToBook,
      roe: stockInfo?.financialData?.returnOnEquity ? +(stockInfo.financialData.returnOnEquity * 100).toFixed(2) : null,
      eps: stockInfo?.defaultKeyStatistics?.trailingEps,
      eps_trend_of_next_quarter: epsTrend.eps_trend_of_next_quarter,
      dividend_yield: stockInfo?.summaryDetail?.dividendYield
        ? +(stockInfo.summaryDetail.dividendYield * 100).toFixed(2)
        : null,
    };
  }

  public async getEpsTrend(symbol: string): Promise<any>{
    try {
      const yahooStockAnalysis = await this.getStockAnalysis(symbol);
      if (!yahooStockAnalysis) return {};

      const epsTrend = yahooStockAnalysis.earningsTrend?.trend;
      if (!epsTrend) return {};

      return {
        eps_trend_of_next_quarter: {
          current: epsTrend[0]?.epsTrend?.current || null,
          sevenDaysAgo: epsTrend[1]?.epsTrend?.sevenDaysAgo || null,
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching analysis for ${symbol}: ${error instanceof Error ? error.message : String(error)}`
      );
      return {};
    }
  }
}
