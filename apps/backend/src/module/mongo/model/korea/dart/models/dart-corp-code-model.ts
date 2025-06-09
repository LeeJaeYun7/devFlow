import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DartCorpCode extends Document {
  @Prop({ required: true })
  corpCode!: string;

  @Prop({ required: true })
  corpName!: string;

  @Prop()
  stockCode?: string;
}

export const DartCorpCodeSchema = SchemaFactory.createForClass(DartCorpCode);
