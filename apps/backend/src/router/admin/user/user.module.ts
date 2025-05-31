import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '../../../module/mongo/model/user/models/user.model';
import { AdminUserController } from './user.controller';
import { AdminUserService } from './user.service';
import { DailyMetricModel, DailyMetricSchema } from '../../../module/mongo/model/metric/models/daily_metric.model';
import { TotalMetricModel, TotalMetricSchema } from '../../../module/mongo/model/metric/models/total_metric.model';
import {
  UserMessageQuotaModel,
  UserMessageQuotaSchema,
} from '../../../module/mongo/model/user/models/user_message_quota.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: DailyMetricModel.name, schema: DailyMetricSchema },
      { name: TotalMetricModel.name, schema: TotalMetricSchema },
      { name: UserMessageQuotaModel.name, schema: UserMessageQuotaSchema },
    ]),
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
