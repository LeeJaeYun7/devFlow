import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NaverStockHistory } from '../../../module/mongo/model/naver/models/naver-stock-history.model';
import { NaverStockInfo } from '../../../module/mongo/model/naver/models/naver-stock-info.model';
import { KoreaStockSymbol } from '../../../module/mongo/model/korea/models/korea-stock-symbol.model';

@Injectable()
export class NaverStockService {
  private readonly logger = new Logger(NaverStockService.name);

  constructor(
    @InjectModel(NaverStockHistory.name)
    private readonly stockHistoryModel: Model<NaverStockHistory>,
    @InjectModel(NaverStockInfo.name)
    private readonly stockInfoModel: Model<NaverStockInfo>,
    @InjectModel(KoreaStockSymbol.name)
    private readonly stockSymbolModel: Model<KoreaStockSymbol>,
  ) {}

  public async saveStockHistory(symbol: string, ohlcvAndIndicators: any, fundamentalData: any) {
    const stockHistory = new this.stockHistoryModel({
      symbol,
      interval: '1d',
      data: Object.entries(ohlcvAndIndicators).map(([date, data]: [string, any]) => ({
        date,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume,
      })),
      marketCap: Number(fundamentalData.marketCap) || 0,
      high52Week: Number(fundamentalData.high52Week) || 0,
      low52Week: Number(fundamentalData.low52Week) || 0,
      lastUpdated: new Date(),
    });

    await stockHistory.save();
    return stockHistory;
  }

  public async saveStockInfo(symbol: string, stockInfo: any) {
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

  public async getStockSymbols(): Promise<{ symbol: string }[]> {
    try {
      const symbols = await this.stockSymbolModel.find().select('symbol').lean();
      this.logger.log(`Found ${symbols.length} symbols in database`);
      return symbols;
    } catch (error) {
      this.logger.error(`Failed to get stock symbols: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
