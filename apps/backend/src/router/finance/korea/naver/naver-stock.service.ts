import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NaverStockHistory } from '../../../../module/mongo/model/korea/naver/models/naver-stock-history.model';
import { NaverStockInfo } from '../../../../module/mongo/model/korea/naver/models/naver-stock-info.model';
import { NaverStockFetcherService } from './fetchers/naver-finance-fetch.service';

@Injectable()
export class NaverStockService {
  private readonly logger = new Logger(NaverStockService.name);

  constructor(
    @InjectModel(NaverStockHistory.name)
    private readonly stockHistoryModel: Model<NaverStockHistory>,
    @InjectModel(NaverStockInfo.name)
    private readonly stockInfoModel: Model<NaverStockInfo>,
    private readonly naverStockFetcherService: NaverStockFetcherService
  ) {}

  async getStockHistory(symbol: string, interval = '1d'): Promise<NaverStockHistory | null> {
    try {
      // MongoDB에서 데이터 조회
      const history = await this.stockHistoryModel.findOne({ symbol, interval }).sort({ createdAt: -1 });

      // 데이터가 없는 경우 fetchTechnicalData에서 가져오기
      if (!history) {
        this.logger.log(`No history found for ${symbol}, fetching from Naver Finance...`);
        const technicalData = await this.naverStockFetcherService.fetchTechnicalData(symbol);

        if (!technicalData) {
          this.logger.warn(`Failed to fetch technical data for ${symbol}`);
          return null;
        }

        // 새로운 히스토리 데이터 생성
        const newHistory = await this.stockHistoryModel.findOneAndUpdate(
          { symbol, interval },
          {
            $setOnInsert: { _id: new Types.ObjectId() },
            $set: {
              symbol,
              interval,
              data: technicalData.ohlcvAndIndicators, // key-value 구조 유지,
              marketCap: technicalData.marketCap,
              high52Week: technicalData.high52Week,
              low52Week: technicalData.low52Week,
            },
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        return newHistory;
      }

      return history;
    } catch (error) {
      this.logger.error(
        `Failed to get stock history for ${symbol}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  async getStockInfo(symbol: string): Promise<NaverStockInfo | null> {
    try {
      // MongoDB에서 데이터 조회
      const info = await this.stockInfoModel.findOne({ symbol }).sort({ updatedAt: -1 });

      // 데이터가 없는 경우 getFundamentalData에서 가져오기
      if (!info) {
        this.logger.log(`No stock info found for ${symbol}, fetching from Naver Finance...`);
        const fundamentalData = await this.naverStockFetcherService.fetchFundamentalData(symbol);

        if (!fundamentalData) {
          this.logger.warn(`Failed to fetch fundamental data for ${symbol}`);
          return null;
        }

        // 새로운 주식 정보 데이터 생성
        const newInfo = new this.stockInfoModel({
          _id: new Types.ObjectId(),
          symbol,
          summaryDetail: {
            currentPrice: fundamentalData.currentPrice,
            marketCap: fundamentalData.marketCap,
            volume: fundamentalData.VOLUME,
          },
          defaultKeyStatistics: {
            PER: fundamentalData.PER,
            EPS: fundamentalData.EPS,
            sharesOutstanding: fundamentalData.sharesOutstanding,
          },
          financialData: {
            totalCash: fundamentalData.capital,
          },
          updatedAt: new Date(),
        });

        // MongoDB에 저장
        await newInfo.save();
        return newInfo;
      }

      return info;
    } catch (error) {
      this.logger.error(
        `Failed to get stock info for ${symbol}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  async saveStockHistory(symbol: string, data: any[], interval: string): Promise<NaverStockHistory> {
    try {
      const stockHistory = await this.stockHistoryModel.findOneAndUpdate(
        { symbol, interval },
        {
          $setOnInsert: { _id: new Types.ObjectId() },
          $set: {
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
          },
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      return stockHistory;
    } catch (error: unknown) {
      this.logger.error(`Error saving stock history for ${symbol}: ${(error as Error).message}`);
      throw error;
    }
  }
}
