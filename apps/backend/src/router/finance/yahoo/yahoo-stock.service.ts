import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dayjs from 'dayjs';
import YahooFinance from 'yahoo-finance2';
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
      // 먼저 MongoDB에서 데이터 조회
      const existingInfo = await this.stockInfoModel.findOne({ symbol }).exec();
      if (existingInfo) {
        return existingInfo;
      }

      // MongoDB에 데이터가 없는 경우 Yahoo Finance API 호출
      const data = await YahooFinance.quoteSummary(symbol, {
        modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'],
      });

      // 데이터가 없는 경우
      if (!data || !data.summaryDetail) {
        this.logger.warn(`No stock info found for symbol ${symbol} in Yahoo Finance`);
        return null;
      }

      // 새로운 주식 정보 데이터 생성
      const newStockInfo = new this.stockInfoModel({
        symbol,
        summaryDetail: data.summaryDetail,
        defaultKeyStatistics: data.defaultKeyStatistics,
        financialData: data.financialData,
        updatedAt: new Date(),
      });

      // MongoDB에 저장
      await newStockInfo.save();
      return newStockInfo;
    } catch (error: unknown) {
      // Yahoo Finance API에서 심볼을 찾을 수 없는 경우
      if (error instanceof Error && error.message.includes('Quote not found')) {
        this.logger.warn(`Symbol ${symbol} not found in Yahoo Finance`);
        return null;
      }

      this.logger.error(`Error getting stock info for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getStockQuote(symbol: string): Promise<YahooStockQuote> {
    try {
      const stockInfo = await this.getStockInfo(symbol);

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

  async getStockHistory(symbol: string, interval: '1d' | '1wk' | '1mo'): Promise<YahooStockHistory | null> {
    try {
      // 먼저 MongoDB에서 데이터 조회
      const existingHistory = await this.stockHistoryModel.findOne({ symbol, interval }).exec();
      if (existingHistory) {
        return existingHistory;
      }

      // MongoDB에 데이터가 없는 경우 Yahoo Finance API 호출
      const data = await YahooFinance.historical(symbol, {
        period1: dayjs().subtract(3, 'month').toDate(),
        interval,
      });

      // 데이터가 없는 경우
      if (!data || data.length === 0) {
        this.logger.warn(`No historical data found for symbol ${symbol} in Yahoo Finance`);
        return null;
      }

      // 새로운 주식 히스토리 데이터 생성
      const newHistory = new this.stockHistoryModel({
        symbol,
        interval,
        data: data.map((item) => ({
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
        })),
        updatedAt: new Date(),
      });

      // MongoDB에 저장
      await newHistory.save();
      return newHistory;
    } catch (error: unknown) {
      // Yahoo Finance API에서 심볼을 찾을 수 없는 경우
      if (error instanceof Error && error.message.includes('Quote not found')) {
        this.logger.warn(`Symbol ${symbol} not found in Yahoo Finance`);
        return null;
      }

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
      // 먼저 MongoDB에서 데이터 조회
      const existingAnalysis = await this.stockAnalysisModel.findOne({ symbol }).exec();
      if (existingAnalysis) {
        return existingAnalysis;
      }

      // MongoDB에 데이터가 없는 경우 Yahoo Finance API 호출
      const data = await YahooFinance.quoteSummary(symbol, {
        modules: ['earningsTrend', 'recommendationTrend', 'earningsHistory', 'earnings'],
      });

      // 새로운 분석 데이터 생성
      const newAnalysis = new this.stockAnalysisModel({
        symbol,
        earningsTrend: data.earningsTrend,
        recommendationTrend: data.recommendationTrend,
        earningsHistory: data.earningsHistory,
        earnings: data.earnings,
        updatedAt: new Date(),
      });

      // MongoDB에 저장
      await newAnalysis.save();
      return newAnalysis;
    } catch (error: unknown) {
      // Yahoo Finance API에서 심볼을 찾을 수 없는 경우
      if (error instanceof Error && error.message.includes('Quote not found')) {
        this.logger.warn(`Symbol ${symbol} not found in Yahoo Finance`);
        return null;
      }

      this.logger.error(`Error getting stock analysis for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getStockNews(symbol: string): Promise<YahooStockNews | null> {
    try {
      // 먼저 MongoDB에서 데이터 조회
      const existingNews = await this.stockNewsModel.findOne({ symbol }).exec();
      if (existingNews) {
        return existingNews;
      }

      // MongoDB에 데이터가 없는 경우 Yahoo Finance API 호출
      const result = await YahooFinance.search(symbol);

      // 검색 결과가 없거나 뉴스가 없는 경우
      if (!result || !result.news || result.news.length === 0) {
        this.logger.warn(`No news found for symbol ${symbol} in Yahoo Finance`);
        return null;
      }

      const news = result.news;

      // 뉴스 데이터 가공
      const newsWithContent = await Promise.all(
        news.map(async (item) => {
          return {
            title: item.title,
            content: item.content || '',
            relatedTickers: (Array.isArray(item.relatedTickers) ? item.relatedTickers : [item.relatedTickers]).filter(
              (ticker): ticker is string => typeof ticker === 'string'
            ),
            pubDate:
              item.providerPublishTime instanceof Date
                ? item.providerPublishTime.toISOString()
                : new Date(item.providerPublishTime).toISOString(),
          };
        })
      );

      // 새로운 뉴스 데이터 생성
      const newNews = new this.stockNewsModel({
        symbol,
        news: newsWithContent,
        updatedAt: new Date(),
      });

      // MongoDB에 저장
      await newNews.save();
      return newNews;
    } catch (error: unknown) {
      // Yahoo Finance API에서 심볼을 찾을 수 없는 경우
      if (error instanceof Error && error.message.includes('Quote not found')) {
        this.logger.warn(`Symbol ${symbol} not found in Yahoo Finance`);
        return null;
      }

      this.logger.error(`Error getting stock news for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async saveStockNews(symbol: string, news: any[]): Promise<YahooStockNews> {
    try {
      const stockNews = new this.stockNewsModel({
        symbol,
        news,
        updatedAt: new Date(),
      });

      return await stockNews.save();
    } catch (error: unknown) {
      this.logger.error(`Error saving stock news for ${symbol}: ${(error as Error).message}`);
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

  public async getEpsTrend(symbol: string): Promise<any> {
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
