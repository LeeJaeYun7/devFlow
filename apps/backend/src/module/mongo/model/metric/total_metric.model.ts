import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TotalMetricList, type TotalMetric } from './metric.constant';

@Schema({ collection: 'total_metrics' })
export class TotalMetricModel extends Document<string> {
  @Prop({ type: String, index: true, enum: TotalMetricList })
  metric!: TotalMetric;

  @Prop()
  value!: number;
}

export const TotalMetricSchema = SchemaFactory.createForClass(TotalMetricModel);
