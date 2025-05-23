import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserModel } from './user.model';

@Schema({ collection: 'user_metrics' })
export class UserMetricModel extends Document<string> {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserModel.name })
  userId!: string;

  @Prop({ default: () => new Date().toISOString().slice(0, 10).replaceAll('-', '') })
  dateKey!: string;
}

export const UserMetricSchema = SchemaFactory.createForClass(UserMetricModel);
