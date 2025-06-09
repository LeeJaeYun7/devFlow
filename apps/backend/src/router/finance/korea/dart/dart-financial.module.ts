import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DartCorpCodeService } from './dart-corp-code.service';
import {
  DartCorpCode,
  DartCorpCodeSchema,
} from '../../../../module/mongo/model/korea/dart/models/dart-corp-code-model';

@Module({
  imports: [MongooseModule.forFeature([{ name: DartCorpCode.name, schema: DartCorpCodeSchema }])],
  providers: [DartCorpCodeService],
})
export class DartFinanceModule {}
