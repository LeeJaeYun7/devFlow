import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserModel } from './user.model';

@Schema({ collection: 'admin_users', timestamps: true })
export class AdminUserModel extends Document<string> {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserModel.name })
  userId!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUserModel);
