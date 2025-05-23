import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MessageRoleList } from '@lia/api/conversation/message/message.constant';
import type { MessageRole } from '@lia/api/conversation/message/message.constant';

type MessageContent = string | null;

@Schema({ collection: 'messages', timestamps: true })
export class MessageModel extends Document<string> {
  @Prop({ required: true, ref: 'ChatModel' })
  chatId!: string;

  @Prop({ required: false, type: mongoose.Schema.Types.Mixed })
  content!: MessageContent;

  @Prop({ required: true, type: String, enum: MessageRoleList })
  role!: MessageRole;

  @Prop({ required: false })
  toolCallId?: string;

  @Prop({ required: false, type: mongoose.Schema.Types.Mixed })
  toolCalls?: Array<{
    id: string;
    function: {
      name: string;
      arguments: string;
    };
    type: 'function';
  }>;

  @Prop({ required: false })
  name?: string;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(MessageModel);
