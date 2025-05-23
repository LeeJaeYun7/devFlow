import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserModel } from '../../user/models/user.model';
import { getDateKey } from '../../../../../util/date';

@Schema({ collection: 'dau_metrics' })
export class DauMetricModel extends Document<string> {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserModel.name })
  userId!: string;

  @Prop({ default: () => getDateKey() })
  dateKey!: string;
}

export const DauMetricSchema = SchemaFactory.createForClass(DauMetricModel);
