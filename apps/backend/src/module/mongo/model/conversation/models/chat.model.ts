import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserModel } from '../../user/models/user.model';

@Schema({ collection: 'chats', timestamps: true })
export class ChatModel extends Document<string> {
  @Prop({ required: true, default: 'New Chat' })
  title!: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: UserModel.name })
  userId!: string;
}

export const ChatSchema = SchemaFactory.createForClass(ChatModel);
