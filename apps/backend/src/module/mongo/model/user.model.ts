import { AuthSsoList } from '@lia/api/auth/auth.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { AuthSso } from '@lia/api/auth/auth.constant';

@Schema({ collection: 'users', timestamps: true })
export class UserModel extends Document<string> {
  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ type: String, required: true, enum: AuthSsoList })
  provider!: AuthSso;

  @Prop({ required: true })
  providerId!: string;

  @Prop({ required: false })
  name?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
