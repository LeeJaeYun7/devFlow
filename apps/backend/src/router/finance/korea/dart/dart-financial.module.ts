import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DartCorpCode,
  DartCorpCodeSchema,
} from '../../../../module/mongo/model/korea/dart/models/dart-corp-code-model';
import {
  DartCompanyInfo,
  DartCompanyInfoSchema,
} from '../../../../module/mongo/model/korea/dart/models/dart-company-info.model';
import { DartCorpService } from './dart-corp.service'; // ✅ Service import
import { DartService } from './dart.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DartCorpCode.name, schema: DartCorpCodeSchema },
      { name: DartCompanyInfo.name, schema: DartCompanyInfoSchema },
    ]),
  ],
  providers: [DartService],
  exports: [DartService],
})
export class DartFinanceModule {}
