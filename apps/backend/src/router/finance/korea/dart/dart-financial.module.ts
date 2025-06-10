import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DartCorpCode,
  DartCorpCodeSchema,
} from '../../../../module/mongo/model/korea/dart/models/dart-corp-code-model';

@Module({
  imports: [MongooseModule.forFeature([{ name: DartCorpCode.name, schema: DartCorpCodeSchema }])],
})
export class DartFinanceModule {}
