import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class ConfigModel extends Document<string> {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ required: true })
  value!: string;
}

export const ConfigSchema = SchemaFactory.createForClass(ConfigModel);
