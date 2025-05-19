import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DEFAULT_MESSAGE_FIRST_QUOTA } from '../../../constants/message.constant';
import { UserModel } from './user.model';

@Schema({ collection: 'user_message_quotas' })
export class UserMessageQuotaModel extends Document<string> {
  @Prop({ required: true, ref: UserModel.name })
  userId!: string;

  @Prop({ required: true, default: DEFAULT_MESSAGE_FIRST_QUOTA })
  remainingMessages!: number;

  @Prop({ required: true, default: () => new Date() })
  lastReset!: Date;
}

export const UserMessageQuotaSchema = SchemaFactory.createForClass(UserMessageQuotaModel);
