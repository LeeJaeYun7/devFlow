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

  async getStockHistory(symbol: string, interval = '1d'): Promise<NaverStockHistory | null> {
    try {
      const history = await this.stockHistoryModel.findOne({ symbol, interval }).sort({ createdAt: -1 });
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
      const info = await this.stockInfoModel.findOne({ symbol }).sort({ lastUpdated: -1 });
      return info;
    } catch (error) {
      this.logger.error(
        `Failed to get stock info for ${symbol}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }
}
