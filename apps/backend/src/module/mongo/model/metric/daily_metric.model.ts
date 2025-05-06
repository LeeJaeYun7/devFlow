import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DailyMetricList, type DailyMetric } from './metric.constant';
import { getDateKey } from '../../../../util/date';

@Schema({ collection: 'daily_metrics' })
export class DailyMetricModel extends Document<string> {
  @Prop({ type: String, index: true, enum: DailyMetricList })
  metric!: DailyMetric;

  @Prop()
  value!: number;

  @Prop({ type: String, index: true, default: () => getDateKey() })
  dateKey!: string;
}

export const DailyMetricSchema = SchemaFactory.createForClass(DailyMetricModel);
