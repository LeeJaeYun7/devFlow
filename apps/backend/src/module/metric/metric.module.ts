import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyMetricModel } from '../mongo/model/metric/daily_metric.model';
import { TotalMetricModel } from '../mongo/model/metric/total_metric.model';
import { DauMetricModel } from '../mongo/model/metric/dau.model';
import { UserMetricService } from './user_metric.service';
import { DailyMetricSchema } from '../mongo/model/metric/daily_metric.model';
import { TotalMetricSchema } from '../mongo/model/metric/total_metric.model';
import { DauMetricSchema } from '../mongo/model/metric/dau.model';
import { UserModel, UserSchema } from '../mongo/model/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: DailyMetricModel.name, schema: DailyMetricSchema },
      { name: TotalMetricModel.name, schema: TotalMetricSchema },
      { name: DauMetricModel.name, schema: DauMetricSchema },
    ]),
  ],
  providers: [UserMetricService],
  exports: [UserMetricService],
})
export class MetricModule {}
