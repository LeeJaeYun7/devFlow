import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NaverStockHistory } from '../../../module/mongo/model/naver/models/naver-stock-history.model';
import { NaverStockInfo } from '../../../module/mongo/model/naver/models/naver-stock-info.model';

@Injectable()
export class NaverStockService {
  private readonly logger = new Logger(NaverStockService.name);

  constructor(
    @InjectModel(NaverStockHistory.name)
    private readonly stockHistoryModel: Model<NaverStockHistory>,
    @InjectModel(NaverStockInfo.name)
    private readonly stockInfoModel: Model<NaverStockInfo>
  ) {}

  async saveStockHistory(symbol: string, ohlcvData: Record<string, any>, interval: string) {
    try {
      const historyData = {
        symbol,
        interval,
        data: ohlcvData,
      };

      await this.stockHistoryModel.findOneAndUpdate(
        { symbol, interval },
        { $set: historyData },
        { upsert: true, new: true }
      );

      this.logger.log(`Successfully saved stock history for ${symbol}`);
    } catch (error) {
      this.logger.error(
        `Failed to save stock history for ${symbol}: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  async saveStockInfo(symbol: string, stockInfo: any) {
    try {
      const infoData = {
        symbol,
        summaryDetail: stockInfo.summaryDetail,
        defaultKeyStatistics: stockInfo.defaultKeyStatistics,
        financialData: stockInfo.financialData,
        lastUpdated: new Date(),
      };

      await this.stockInfoModel.findOneAndUpdate({ symbol }, { $set: infoData }, { upsert: true, new: true });

      this.logger.log(`Successfully saved stock info for ${symbol}`);
    } catch (error) {
      this.logger.error(
        `Failed to save stock info for ${symbol}: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }
}
