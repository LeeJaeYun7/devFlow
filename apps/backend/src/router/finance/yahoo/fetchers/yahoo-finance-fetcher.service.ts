import { Injectable, Logger } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';
import dayjs from 'dayjs';
import { YahooStockService } from '../yahoo-stock.service';
import axios from 'axios';
import * as cheerio from 'cheerio'; 

@Injectable()
export class YahooFinanceFetcherService {
  private readonly logger = new Logger(YahooFinanceFetcherService.name);

  constructor(private readonly yahooStockService: YahooStockService) {}

  public async fetchAnalysis(symbol: string): Promise<any> {
    try {
      // Check MongoDB first
      const existingAnalysis = await this.yahooStockService.getStockAnalysis(symbol);
      if (existingAnalysis) {
        return existingAnalysis;
      }

      // If not in MongoDB, fetch from Yahoo Finance
      const data = await YahooFinance.quoteSummary(symbol, {
        modules: ['earningsTrend', 'recommendationTrend', 'earningsHistory', 'earnings'],
      });

      console.log("data", data);

      // Save to MongoDB
      await this.yahooStockService.saveStockAnalysis(symbol, data);
      return data;
    } catch (error: any) {
      this.logger.error(`Error fetching analysis for ${symbol}: ${error.message}`);
      return {};
    }
  }

  public async fetchInfo(symbol: string): Promise<any> {
    try {
      // Check MongoDB first
      const existingData = await this.yahooStockService.getStockInfo(symbol);
      if (existingData) {
        return {
          summaryDetail: existingData.summaryDetail,
          defaultKeyStatistics: existingData.defaultKeyStatistics,
          financialData: existingData.financialData,
        };
      }

      // If not in MongoDB, fetch from Yahoo Finance
      const data = await YahooFinance.quoteSummary(symbol, {
        modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'],
      });
      
      // Save to MongoDB
      await this.yahooStockService.saveStockInfo(symbol, data);
      return data;
    } catch (error: any) {
      this.logger.error(`Error fetching info for ${symbol}: ${error.message}`);
      return {};
    }
  }

  public async fetchHistory(symbol: string, _period = '3mo', interval: '1d' | '1wk' | '1mo' = '1d'): Promise<any> {
    try {
      // Check MongoDB first
      const existingHistory = await this.yahooStockService.getStockHistory(symbol, interval);
      
      if (existingHistory) {
        return existingHistory;
      }

      // If not in MongoDB, fetch from Yahoo Finance
      const data = await YahooFinance.historical(symbol, {
        period1: dayjs().subtract(3, 'month').toDate(),
        interval,
      });

      // Save to MongoDB
      await this.yahooStockService.saveStockHistory(symbol, data, interval);
      return data;
    } catch (error: any) {
      this.logger.error(`Error fetching history for ${symbol}: ${error.message}`);
      return [];
    }
  }

  public async fetchNews(symbol: string): Promise<any[]> {
    try {
      // Check MongoDB first
      const existingNews = await this.yahooStockService.getStockNews(symbol);

      if (existingNews) {
        return existingNews.news;
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
      await this.yahooStockService.saveStockNews(symbol, newsWithContent);
  
      return newsWithContent;

      return news;
    } catch (error: any) {
      this.logger.error(`Error fetching news for ${symbol}: ${error.message}`);
      return [];
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
  

  public extractContentInfo(item: any): Record<string, string> {
    const fields = ['title', 'description', 'summary', 'pubDate'];
    const content = item.content || {};
    return fields.reduce(
      (acc, key) => {
        acc[key] = content[key] || '';
        return acc;
      },
      {} as Record<string, string>
    );
  }

  public async getNews(symbol: string): Promise<Record<string, string>[]> {
    const news = await this.fetchNews(symbol);
    return news.map((article) => this.extractContentInfo(article));
  }

  public async getAnalysis(symbol: string): Promise<any> {
    try {
      const analysis = await this.fetchAnalysis(symbol);
      const epsTrend = analysis?.epsTrend?.trend;
      if (!epsTrend) return {};

      return {
        eps_trend_of_next_quarter: {
          current: epsTrend[0]?.eps || null,
          sevenDaysAgo: epsTrend[1]?.eps || null,
        },
      };
    } catch (error: any) {
      this.logger.error(`Error fetching analysis for ${symbol}: ${error.message}`);
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
      currentPrice: info?.summaryDetail?.regularMarketPrice,
      changePercent: info?.summaryDetail?.regularMarketChangePercent,
      marketCap: info?.summaryDetail?.marketCap,
      high52Week: info?.summaryDetail?.fiftyTwoWeekHigh,
      low52Week: info?.summaryDetail?.fiftyTwoWeekLow,
    };
  }

  public async getOhlcvAndIndicators(symbol: string): Promise<any> {
    const data = await this.fetchHistory(symbol);
    if (!data || !Array.isArray(data) || data.length === 0) return {};

    const df = data.map((item) => ({
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
