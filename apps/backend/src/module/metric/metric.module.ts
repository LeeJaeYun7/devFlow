import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyMetricModel } from '../mongo/model/metric/models/daily_metric.model';
import { TotalMetricModel } from '../mongo/model/metric/models/total_metric.model';
import { DauMetricModel } from '../mongo/model/metric/models/dau.model';
import { UserMetricService } from './user_metric.service';
import { DailyMetricSchema } from '../mongo/model/metric/models/daily_metric.model';
import { TotalMetricSchema } from '../mongo/model/metric/models/total_metric.model';
import { DauMetricSchema } from '../mongo/model/metric/models/dau.model';
import { UserModel, UserSchema } from '../mongo/model/user/models/user.model';

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
