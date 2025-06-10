import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../../types/base.type';

export class UserMetricDto {}

export class MetricData {
  @ApiProperty({ description: 'metric' })
  metric!: string;

  @ApiProperty({ description: '값' })
  value!: number;

  @ApiProperty({ description: '차이' })
  diff!: number;

  @ApiProperty({ description: '차이 비율' })
  diffRate!: number;
}

class UserMetricData {
  @ApiProperty({ type: MetricData })
  dau!: MetricData;

  @ApiProperty({ type: MetricData })
  nru!: MetricData;

  @ApiProperty({ type: MetricData })
  totalUser!: MetricData;

  @ApiProperty({ type: MetricData })
  d1Retention!: MetricData;

  @ApiProperty({ type: MetricData })
  d7Retention!: MetricData;
}

export class UserMetricResponse extends BaseResponse {
  @ApiProperty({ type: UserMetricData })
  data!: UserMetricData;
}
