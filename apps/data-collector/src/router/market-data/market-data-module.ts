import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { NaverMarketScheduler } from './naver/naver-market-data-scheduler';
import { YahooMarketScheduler } from './yahoo/yahoo-market-data-scheduler';
import { NaverStockService } from './naver/naver-market-data-service';
import { YahooStockService } from './yahoo/yahoo-market-data-service';
import { NasdaqSymbolScheduler } from './nasdaq/nasdaq-symbol-scheduler';
import { NasdaqSymbolService } from './nasdaq/nasdaq-symbol.service';
import { YahooStockInfo, YahooStockInfoSchema } from '../../module/mongo/model/yahoo/models/yahoo-stock-info.model';
import {
  YahooStockHistory,
  YahooStockHistorySchema,
} from '../../module/mongo/model/yahoo/models/yahoo-stock-history.model';
import {
  YahooStockAnalysis,
  YahooStockAnalysisSchema,
} from '../../module/mongo/model/yahoo/models/yahoo-stock-analysis.model';
import { YahooStockNews, YahooStockNewsSchema } from '../../module/mongo/model/yahoo/models/yahoo-stock-news.model';
import {
  NaverStockHistory,
  NaverStockHistorySchema,
} from '../../module/mongo/model/naver/models/naver-stock-history.model';
import { NaverStockInfo, NaverStockInfoSchema } from '../../module/mongo/model/naver/models/naver-stock-info.model';
import {
  NasdaqStockSymbol,
  NasdaqStockSymbolSchema,
} from '../../module/mongo/model/nasdaq/models/nasdaq-stock-symbol.model';
import {
  KoreaStockSymbol,
  KoreaStockSymbolSchema,
} from '../../module/mongo/model/korea/models/korea-stock-symbol.model';
import { MongoModule } from '../../module/mongo/mongo.module';
import { KoreaSymbolService } from './korea/korea-symbol.service';
import { KoreaSymbolScheduler } from './korea/korea-symbol-scheduler';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongoModule,
    MongooseModule.forFeature([
      { name: YahooStockInfo.name, schema: YahooStockInfoSchema },
      { name: YahooStockHistory.name, schema: YahooStockHistorySchema },
      { name: YahooStockAnalysis.name, schema: YahooStockAnalysisSchema },
      { name: YahooStockNews.name, schema: YahooStockNewsSchema },
      { name: NaverStockHistory.name, schema: NaverStockHistorySchema },
      { name: NaverStockInfo.name, schema: NaverStockInfoSchema },
      { name: NasdaqStockSymbol.name, schema: NasdaqStockSymbolSchema },
      { name: KoreaStockSymbol.name, schema: KoreaStockSymbolSchema },
    ]),
  ],
  providers: [
    NaverMarketScheduler,
    YahooMarketScheduler,
    YahooStockService,
    NaverStockService,
    NasdaqSymbolScheduler,
    NasdaqSymbolService,
    KoreaSymbolService,
    KoreaSymbolScheduler,
  ],
})
export class MarketDataModule {}
