import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'users', timestamps: true })
export class UserModel extends Document<string> {
  @Prop({ required: true, unique: true })
  email!: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
