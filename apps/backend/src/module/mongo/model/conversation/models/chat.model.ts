import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserModel } from '../../user/models/user.model';

@Schema({ collection: 'chats', timestamps: true })
export class ChatModel extends Document<string> {
  @Prop({ required: true, default: 'New Chat' })
  title!: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: UserModel.name })
  userId!: string;

  @Prop({ required: false, default: false })
  deleted!: boolean;

  @Prop({ required: true, default: 16 })
  leftMessageCount!: number;
}

export const ChatSchema = SchemaFactory.createForClass(ChatModel);
