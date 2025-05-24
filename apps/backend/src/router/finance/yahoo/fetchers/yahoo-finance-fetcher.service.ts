import { Injectable, Logger } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';
import dayjs from 'dayjs';
import { YahooStockService } from '../yahoo-stock.service';
import { YahooStockNews } from '../../../../module/mongo/model/yahoo/models/yahoo-stock-news.model';
import { YahooStockHistory } from '../../../../module/mongo/model/yahoo/models/yahoo-stock-history.model';
import { YahooStockInfo } from '../../../../module/mongo/model/yahoo/models/yahoo-stock-info.model';
import type { YahooStockNewsItem } from '../../../../module/mongo/model/yahoo/interfaces/yahoo-stock-news-interface';
import { YahooStockAnalysis } from '../../../../module/mongo/model/yahoo/models/yahoo-stock-analysis.model';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class YahooFinanceFetcherService {
  private readonly logger = new Logger(YahooFinanceFetcherService.name);

  constructor(private readonly yahooStockService: YahooStockService) {}

  public async fetchAnalysis(symbol: string): Promise<YahooStockAnalysis | null> {
    try {
      // Check MongoDB first
      const cached = await this.yahooStockService.getStockAnalysis(symbol);
      if (cached) {
        return cached;
      }

      // If not in MongoDB, fetch from Yahoo Finance
      const data = await YahooFinance.quoteSummary(symbol, {
        modules: ['earningsTrend', 'recommendationTrend', 'earningsHistory', 'earnings'],
      });

      // Save to MongoDB
      return await this.yahooStockService.saveStockAnalysis(symbol, data);
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching analysis for ${symbol}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  public async fetchInfo(symbol: string): Promise<YahooStockInfo | null> {
    try {
      // Check MongoDB first
      const cached = await this.yahooStockService.getStockInfo(symbol);
      if (cached) {
        return cached;
      }

      // If not in MongoDB, fetch from Yahoo Finance
      const data = await YahooFinance.quoteSummary(symbol, {
        modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'],
      });
       // Save to MongoDB
      return await this.yahooStockService.saveStockInfo(symbol, data);
    } catch (error: unknown) {
      this.logger.error(`Error fetching info for ${symbol}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  public async fetchHistory(
    symbol: string,
    _period = '3mo',
    interval: '1d' | '1wk' | '1mo' = '1d'
  ): Promise<YahooStockHistory | null> {
    try {
      // Check MongoDB first
      const cached = await this.yahooStockService.getStockHistory(symbol, interval);
  
      if (cached) {
        return cached;
      }

      // If not in MongoDB, fetch from Yahoo Finance
      const data = await YahooFinance.historical(symbol, {
        period1: dayjs().subtract(3, 'month').toDate(),
        interval,
      });

      // Save to MongoDB
      return await this.yahooStockService.saveStockHistory(symbol, data, interval);
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching history for ${symbol}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  public async fetchNews(symbol: string): Promise<YahooStockNews | null> {
    try {
      // Check MongoDB first
      const cached = await this.yahooStockService.getStockNews(symbol);

      if (cached) {
        return cached;
      }
      // If not in MongoDB, fetch from Yahoo Finance
      const result = await YahooFinance.search(symbol);
      const news = result?.news ?? [];

      // Save to MongoDB
      const newsWithContent = await Promise.all(
        news.map(async (item) => {
          const content = await this.fetchArticleContent(item.link);
  
          return {
            title: item.title,
            content,
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
      // 4. MongoDB 저장
      return await this.yahooStockService.saveStockNews(symbol, newsWithContent);
    } catch (error: unknown) {
      this.logger.error(`Error fetching news for ${symbol}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  public async fetchArticleContent(url: string): Promise<string> {
    try {
      const { data: html } = await axios.get(url, { timeout: 5000 });
      const $ = cheerio.load(html);
  
      // 아래는 사이트마다 다르니 각 도메인별로 분기해야 함
      if (url.includes('finance.yahoo.com')) {
        return $('article').text().trim(); // Yahoo는 대부분 <article> 태그 안에 본문
      } else if (url.includes('marketwatch.com')) {
        return $('.article__body').text().trim();
      }
  
      // 기본 fallback
      return $('body').text().slice(0, 3000).trim(); // 너무 길면 자름
    } catch (e) {
      console.warn(`Failed to fetch content from ${url}: ${e.message}`);
      return '';
    }
  }
  

  public formatNewsItem(item: YahooStockNewsItem): Record<string, string> {
    return {
      title: item.title || '',
      content: item.content || '',
      relatedTickers: item.relatedTickers?.join(', ') || '',
      pubDate: item.pubDate || '',
    };
  }

  public async getNews(symbol: string): Promise<Record<string, string>[]> {
    const yahooStocknews = await this.fetchNews(symbol);
    if (!yahooStocknews) return [];
    const news = yahooStocknews.news ?? [];
    return news.map((item) => this.formatNewsItem(item));
  }

  public async getAnalysis(symbol: string): Promise<any>{
    try {
      const yahooStockAnalysis = await this.fetchAnalysis(symbol);
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

  public async getFundamentalMetrics(symbol: string): Promise<any> {
    const info = await this.fetchInfo(symbol);
    const analysis = await this.getAnalysis(symbol);

    return {
      pe_trailing: info?.summaryDetail?.trailingPE,
      pe_forward: info?.summaryDetail?.forwardPE,
      pb_ratio: info?.defaultKeyStatistics?.priceToBook,
      roe: info?.financialData?.returnOnEquity ? +(info.financialData.returnOnEquity * 100).toFixed(2) : null,
      eps: info?.defaultKeyStatistics?.trailingEps,
      eps_trend_of_next_quarter: analysis.eps_trend_of_next_quarter,
      dividend_yield: info?.summaryDetail?.dividendYield ? +(info.summaryDetail.dividendYield * 100).toFixed(2) : null,
    };
  }

  public async getQuote(symbol: string): Promise<any> {
    const info = await this.fetchInfo(symbol);
    return {
      currentPrice: info?.summaryDetail?.regularMarketOpen,
      changePercent: info?.summaryDetail?.regularMarketChangePercent,
      marketCap: info?.summaryDetail?.marketCap,
      high52Week: info?.summaryDetail?.fiftyTwoWeekHigh,
      low52Week: info?.summaryDetail?.fiftyTwoWeekLow,
    };
  }

  public async getOhlcvAndIndicators(symbol: string): Promise<Record<string, any>> {
    const history = await this.fetchHistory(symbol);
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
}
