import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NaverStockFetcherService } from './fetchers/naver-finance-fetch.service';
import {
  NaverStockFundamentals,
  NaverStockFundamentalsSchema,
} from '../../../module/mongo/model/naver/models/naver-stock-fundamentals.model';
import { NaverStockNews, NaverStockNewsSchema } from '../../../module/mongo/model/naver/models/naver-stock-news.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NaverStockFundamentals.name, schema: NaverStockFundamentalsSchema },
      { name: NaverStockNews.name, schema: NaverStockNewsSchema },
    ]),
  ],
  providers: [NaverStockFetcherService],
  exports: [NaverStockFetcherService],
})
export class NaverFinanceModule {}
