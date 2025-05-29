import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { YahooStockInfo } from '../../../module/mongo/model/yahoo/models/yahoo-stock-info.model';
import { YahooStockHistory } from '../../../module/mongo/model/yahoo/models/yahoo-stock-history.model';
import { YahooStockAnalysis } from '../../../module/mongo/model/yahoo/models/yahoo-stock-analysis.model';
import { YahooStockNews } from '../../../module/mongo/model/yahoo/models/yahoo-stock-news.model';
import type {
  RecommendationTrend,
  Earnings,
  EarningsTrend,
  EarningsHistory,
} from '../../../module/mongo/model/yahoo/interfaces/yahoo-stock-analysis-interface';

@Injectable()
export class YahooStockService {
  private readonly logger = new Logger(YahooStockService.name);

  constructor(
    @InjectModel(YahooStockInfo.name) private readonly stockInfoModel: Model<YahooStockInfo>,
    @InjectModel(YahooStockHistory.name) private readonly stockHistoryModel: Model<YahooStockHistory>,
    @InjectModel(YahooStockAnalysis.name) private readonly stockAnalysisModel: Model<YahooStockAnalysis>,
    @InjectModel(YahooStockNews.name) private readonly stockNewsModel: Model<YahooStockNews>
  ) {}

  async saveStockInfo(symbol: string, data: Record<string, any>): Promise<YahooStockInfo> {
    try {
      const stockInfo = await this.stockInfoModel.findOneAndUpdate(
        { symbol },
        {
          $setOnInsert: { _id: new Types.ObjectId() },
          $set: {
            symbol,
            summaryDetail: data.summaryDetail,
            defaultKeyStatistics: data.defaultKeyStatistics,
            financialData: data.financialData,
            lastUpdated: new Date(),
            expiresAt: new Date(Date.now() + 2 * 3600 * 1000), // 2시간간 후 만료
          }
        },
        { upsert: true, new: true }
      );
      return stockInfo;
    } catch (error: unknown) {
      this.logger.error(`Error saving stock info for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getStockInfo(symbol: string): Promise<YahooStockInfo | null> {
    try {
      return await this.stockInfoModel.findOne({ symbol }).exec();
    } catch (error: unknown) {
      this.logger.error(`Error getting stock info for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteStockInfo(symbol: string): Promise<boolean> {
    try {
      const result = await this.stockInfoModel.deleteOne({ symbol }).exec();
      return result.deletedCount > 0;
    } catch (error: unknown) {
      this.logger.error(`Error deleting stock info for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async saveStockHistory(symbol: string, data: any[], interval: string): Promise<YahooStockHistory> {
    try {
      const formattedData = data.map((item) => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));

      const stockHistory = await this.stockHistoryModel.findOneAndUpdate(
        { symbol, interval },
        {
          $setOnInsert: { _id: new Types.ObjectId() },
          $set: {
            symbol,
            interval,
            data: formattedData,
            lastUpdated: new Date(),
            expiresAt: new Date(Date.now() + 2 * 3600 * 1000), // 2시간 후 만료
          }
        },
        { upsert: true, new: true }
      );
      return stockHistory;
    } catch (error: unknown) {
      this.logger.error(`Error saving stock history for ${symbol}: ${(error as Error).message}`);
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

  async deleteStockHistory(symbol: string, interval: string): Promise<boolean> {
    try {
      const result = await this.stockHistoryModel.deleteOne({ symbol, interval }).exec();
      return result.deletedCount > 0;
    } catch (error: unknown) {
      this.logger.error(`Error deleting stock history for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async saveStockAnalysis(
    symbol: string,
    data: {
      recommendationTrend: RecommendationTrend | undefined;
      earnings: Earnings | undefined;
      earningsTrend: EarningsTrend | undefined;
      earningsHistory: EarningsHistory | undefined;
    }
  ): Promise<YahooStockAnalysis> {
    try {
      const stockAnalysis = await this.stockAnalysisModel.findOneAndUpdate(
        { symbol },
        {
          $setOnInsert: { _id: new Types.ObjectId() },
          $set: {
            symbol,
            recommendationTrend: data.recommendationTrend,
            earnings: data.earnings,
            earningsTrend: data.earningsTrend,
            earningsHistory: data.earningsHistory,
            lastUpdated: new Date(),
            expiresAt: new Date(Date.now() + 2 * 3600 * 1000), // 2시간 후 만료
          }
        },
        { upsert: true, new: true }
      );
      return stockAnalysis;
    } catch (error: unknown) {
      this.logger.error(`Error saving stock analysis for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async getStockAnalysis(symbol: string): Promise<YahooStockAnalysis | null> {
    try {
      return await this.stockAnalysisModel.findOne({ symbol }).exec();
    } catch (error: unknown) {
      this.logger.error(`Error getting stock analysis for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteStockAnalysis(symbol: string): Promise<boolean> {
    try {
      const result = await this.stockAnalysisModel.deleteOne({ symbol }).exec();
      return result.deletedCount > 0;
    } catch (error: unknown) {
      this.logger.error(`Error deleting stock analysis for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }

  async saveStockNews(
    symbol: string,
    news: Array<{ title: string; content: string; relatedTickers: string[]; pubDate: string }>
  ): Promise<YahooStockNews> {
    try {
      const stockNews = await this.stockNewsModel.findOneAndUpdate(
        { symbol },
        {
          $setOnInsert: { _id: new Types.ObjectId() },
          $set: {
            symbol,
            news,
            lastUpdated: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10분 후 만료
          }
        },
        { upsert: true, new: true }
      );
      return stockNews;
    } catch (error: unknown) {
      this.logger.error(`Error saving stock news for ${symbol}: ${(error as Error).message}`);
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

  async deleteStockNews(symbol: string): Promise<boolean> {
    try {
      const result = await this.stockNewsModel.deleteOne({ symbol }).exec();
      return result.deletedCount > 0;
    } catch (error: unknown) {
      this.logger.error(`Error deleting stock news for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }
}
