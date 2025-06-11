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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DartCorpCode.name, schema: DartCorpCodeSchema },
      { name: DartCompanyInfo.name, schema: DartCompanyInfoSchema }, // ✅ 회사 실적 모델도 추가
    ]),
  ],
  providers: [DartCorpService], // ✅ Service 등록
  exports: [DartCorpService], // ✅ (선택) 다른 모듈에서 주입 가능하게 export
})
export class DartFinanceModule {}
