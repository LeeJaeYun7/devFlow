import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { DailyMetricModel } from '../mongo/model/metric/models/daily_metric.model';
import { DauMetricModel } from '../mongo/model/metric/models/dau.model';
import { TotalMetricModel } from '../mongo/model/metric/models/total_metric.model';
import { DailyMetric, DailyMetricMap, TotalMetricMap } from '../mongo/model/metric/interfaces/metric.constant';
import { getDateKey } from '../../util/date';
import { UserModel } from '../mongo/model/user/models/user.model';

@Injectable()
export class UserMetricService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,

    @InjectModel(DailyMetricModel.name)
    private readonly dailyMetricModel: Model<DailyMetricModel>,

    @InjectModel(TotalMetricModel.name)
    private readonly totalMetricModel: Model<TotalMetricModel>,

    @InjectModel(DauMetricModel.name)
    private readonly dauMetricModel: Model<DauMetricModel>
  ) {}

  public async createNewUser(userId: string) {
    const dateKey = getDateKey();

    await this.dailyMetricModel.findOneAndUpdate(
      { metric: DailyMetricMap.nru, dateKey },
      { $inc: { value: 1 } },
      { upsert: true }
    );

    await this.totalMetricModel.findOneAndUpdate(
      { metric: TotalMetricMap.totalUser },
      { $inc: { value: 1 } },
      { upsert: true }
    );

    await this.accessToday(userId);
  }

  public async accessToday(userId: string) {
    const dateKey = getDateKey();
    await this.dauMetricModel.findOneAndUpdate({ userId, dateKey }, {}, { upsert: true });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async updateDailyMetric() {
    await this.updateRetention(DailyMetricMap.d1Retention, 2);
    await this.updateRetention(DailyMetricMap.d7Retention, 8);
    await this.updateDailyTotalUser();
    await this.updateDau();
  }

  private async updateRetention(key: DailyMetric, dayAgo: number) {
    const yesterday = getYesterday();
    const yesterdayKey = getDateKey(yesterday);

    const dayAgoDate = new Date();
    dayAgoDate.setDate(dayAgoDate.getDate() - dayAgo);
    dayAgoDate.setHours(0, 0, 0, 0);

    const dayAgoRegisters = await this.userModel.find({
      createdAt: { $gte: dayAgoDate, $lt: yesterday },
    });

    if (dayAgoRegisters.length === 0) {
      await this.dailyMetricModel.create({
        metric: key,
        dateKey: yesterdayKey,
        value: 0,
      });
      return;
    }

    const dayAgoDau = await this.dauMetricModel
      .find({
        dateKey: yesterdayKey,
        userId: { $in: dayAgoRegisters.map((user) => user._id) },
      })
      .countDocuments();

    const retention = +((dayAgoDau / dayAgoRegisters.length) * 100).toFixed(2);

    await this.dailyMetricModel.create({
      metric: key,
      dateKey: yesterdayKey,
      value: retention,
    });
  }

  private async updateDailyTotalUser() {
    const yesterday = getYesterday();
    const userCount = await this.userModel.countDocuments();

    await this.dailyMetricModel.create({
      metric: DailyMetricMap.totalUser,
      dateKey: getDateKey(yesterday),
      value: userCount,
    });
  }

  private async updateDau() {
    const yesterday = getYesterday();
    const dauCount = await this.dauMetricModel.countDocuments();

    await this.dailyMetricModel.create({
      metric: DailyMetricMap.dau,
      dateKey: getDateKey(yesterday),
      value: dauCount,
    });
  }
}

function getYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
}
