import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DartFundamental,
  DartFundamentalSchema,
} from '../../../../module/mongo/model/korea/dart/models/dart-stock-fundamental.model';
import { DartFinanceService } from './dart-finance.service';
import { DartStockFetcherService } from './fetchers/dart-finance-fetch.service';
import { DartCorpCodeController } from './dart-corp-code.controller';
import { DartCorpCodeService } from './dart-corp-code.service';
import {
  DartCorpCode,
  DartCorpCodeSchema,
} from '../../../../module/mongo/model/korea/dart/models/dart-corp-code.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DartFundamental.name, schema: DartFundamentalSchema },
      { name: DartCorpCode.name, schema: DartCorpCodeSchema },
    ]),
  ],
  controllers: [DartCorpCodeController],
  providers: [DartFinanceService, DartStockFetcherService, DartCorpCodeService],
  exports: [DartFinanceService, DartStockFetcherService],
})
export class DartFinanceModule {}
