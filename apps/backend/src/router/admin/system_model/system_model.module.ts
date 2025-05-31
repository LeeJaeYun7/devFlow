import { Module } from '@nestjs/common';
import { SystemModelController } from './system_model.controller';
import { SystemModelService } from './system_model.service';
import { SystemModelModel, SystemModelSchema } from '../../../module/mongo/model/system_model.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: SystemModelModel.name, schema: SystemModelSchema }])],
  controllers: [SystemModelController],
  providers: [SystemModelService],
})
export class SystemModelModule {}
