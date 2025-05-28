import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NaverStockInfo, NaverStockInfoSchema } from '../../../module/mongo/model/naver/models/naver-stock-info.model';
import {
  NaverStockHistory,
  NaverStockHistorySchema,
} from '../../../module/mongo/model/naver/models/naver-stock-history.model';
import { NaverFinanceService } from './naver-finance.service';
import { NaverStockService } from './naver-stock.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NaverStockHistory.name, schema: NaverStockHistorySchema },
      { name: NaverStockInfo.name, schema: NaverStockInfoSchema },
    ]),
  ],
  providers: [NaverFinanceService, NaverStockService],
  exports: [NaverFinanceService, NaverStockService],
})
export class NaverFinanceModule {}
