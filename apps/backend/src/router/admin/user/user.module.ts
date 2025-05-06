import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '../../../module/mongo/model/user.model';
import { AdminUserController } from './user.controller';
import { AdminUserService } from './user.service';
import { DailyMetricModel, DailyMetricSchema } from '../../../module/mongo/model/metric/daily_metric.model';
import { TotalMetricModel, TotalMetricSchema } from '../../../module/mongo/model/metric/total_metric.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: DailyMetricModel.name, schema: DailyMetricSchema },
      { name: TotalMetricModel.name, schema: TotalMetricSchema },
    ]),
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
