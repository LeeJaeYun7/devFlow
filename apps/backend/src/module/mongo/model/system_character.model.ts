import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'system_characters', timestamps: true })
export class SystemCharacterModel extends Document<string> {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  image!: string;

  @Prop({ required: true })
  systemPrompt!: string;
}

export const SystemCharacterSchema = SchemaFactory.createForClass(SystemCharacterModel);
