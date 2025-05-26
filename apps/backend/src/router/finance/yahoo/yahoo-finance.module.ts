import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YahooStockInfo, YahooStockInfoSchema } from '../../../module/mongo/model/yahoo/models/yahoo-stock-info.model';
import {
  YahooStockHistory,
  YahooStockHistorySchema,
} from '../../../module/mongo/model/yahoo/models/yahoo-stock-history.model';
import {
  YahooStockAnalysis,
  YahooStockAnalysisSchema,
} from '../../../module/mongo/model/yahoo/models/yahoo-stock-analysis.model';
import { YahooStockNews, YahooStockNewsSchema } from '../../../module/mongo/model/yahoo/models/yahoo-stock-news.model';
import { YahooFinanceService } from './yahoo-finance.service';
import { YahooFinanceFetcherService } from './fetchers/yahoo-finance-fetcher.service';
import { YahooStockService } from './yahoo-stock.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YahooStockInfo.name, schema: YahooStockInfoSchema },
      { name: YahooStockHistory.name, schema: YahooStockHistorySchema },
      { name: YahooStockAnalysis.name, schema: YahooStockAnalysisSchema },
      { name: YahooStockNews.name, schema: YahooStockNewsSchema },
    ]),
  ],
  providers: [YahooStockService, YahooFinanceFetcherService, YahooFinanceService],
  exports: [YahooStockService, YahooFinanceFetcherService, YahooFinanceService],
})
export class YahooFinanceModule {}
