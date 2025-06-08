import { MetricData, UserMetricDto, UserMetricResponse } from '@lia/api/admin/user/metric.dto';
import { UserListDto, UserListResponse } from '@lia/api/admin/user/list.dto';
import { ServiceReturnType } from '@lia/api/types/base.type';
import { Injectable } from '@nestjs/common';
import { UserModel } from '../../../module/mongo/model/user/models/user.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DailyMetricModel } from '../../../module/mongo/model/metric/models/daily_metric.model';
import { TotalMetricModel } from '../../../module/mongo/model/metric/models/total_metric.model';
import {
  DailyMetric,
  DailyMetricList,
  DailyMetricMap,
  TotalMetricMap,
} from '../../../module/mongo/model/metric/interfaces/metric.constant';
import { getDateKey } from '../../../util/date';
import { UserMessageQuotaModel } from '../../../module/mongo/model/user/models/user_message_quota.model';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,

    @InjectModel(DailyMetricModel.name)
    private readonly dailyMetricModel: Model<DailyMetricModel>,

    @InjectModel(TotalMetricModel.name)
    private readonly totalMetricModel: Model<TotalMetricModel>,

    @InjectModel(UserMessageQuotaModel.name)
    private readonly userMessageQuotaModel: Model<UserMessageQuotaModel>
  ) {}

  public async listUser(dto: UserListDto): ServiceReturnType<UserListResponse> {
    const { page, limit } = dto;

    const data = await this.userModel
      .find({})
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const userMessageQuota = await this.userMessageQuotaModel.find({
      userId: { $in: data.map((user) => user._id) },
    });

    return {
      data: data.map((user) => ({
        provider: user.provider,
        email: user.email,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        remainingMessages: userMessageQuota.find((quota) => quota.userId === user._id)?.remainingMessages ?? 0,
      })),
      meta: {
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
      },
    };
  }

  public async getUserMetric(_: UserMetricDto): ServiceReturnType<UserMetricResponse> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateKey = getDateKey(yesterday);

    const totalUser = await this.totalMetricModel.findOne({ metric: TotalMetricMap.totalUser });
    const dailyMetricList = await this.dailyMetricModel
      .find({
        metric: DailyMetricList,
        dateKey: { $gte: yesterdayDateKey },
      })
      .sort({ dateKey: 1 });

    const dau = this.getDailyMetricResult(DailyMetricMap.dau, dailyMetricList);
    const nru = this.getDailyMetricResult(DailyMetricMap.nru, dailyMetricList);
    const d1Retention = this.getDailyMetricResult(DailyMetricMap.d1Retention, dailyMetricList);
    const d7Retention = this.getDailyMetricResult(DailyMetricMap.d7Retention, dailyMetricList);
    const yesterdayTotalUser = dailyMetricList.find(
      (metric) => metric.metric === TotalMetricMap.totalUser && metric.dateKey === yesterdayDateKey
    );

    return {
      totalUser: calculateMetric(TotalMetricMap.totalUser, totalUser, yesterdayTotalUser),
      dau: calculateMetric(DailyMetricMap.dau, dau.yesterday, dau.twoDaysAgo),
      run: calculateMetric(DailyMetricMap.nru, nru.yesterday, nru.twoDaysAgo),
      d1Retention: calculateMetric(DailyMetricMap.d1Retention, d1Retention.yesterday, d1Retention.twoDaysAgo),
      d7Retention: calculateMetric(DailyMetricMap.d7Retention, d7Retention.yesterday, d7Retention.twoDaysAgo),
    };
  }

  private getDailyMetricResult(metricKey: DailyMetric, metricList: DailyMetricModel[]) {
    const metric = metricList.filter((metric) => metric.metric === metricKey);

    const yesterday = metric[1];
    const twoDaysAgo = metric[2];

    return {
      yesterday,
      twoDaysAgo,
    };
  }
}

function calculateMetric(key: string, metric?: Metric | null, prevMetric?: Metric | null): MetricData {
  const currentValue = metric?.value ?? 0;
  const prevValue = prevMetric?.value ?? 0;

  const diff = currentValue - prevValue;
  const diffRate = prevValue ? +((diff / prevValue) * 100).toFixed(2) : 0;

  return {
    metric: key,
    value: currentValue,
    diff,
    diffRate,
  };
}

interface Metric {
  value?: number;
}
