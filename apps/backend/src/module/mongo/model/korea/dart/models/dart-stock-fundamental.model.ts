import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DartFundamental extends Document {
  @Prop({ required: true })
  corpCode!: string;

  @Prop({ required: true })
  corpName!: string;

  @Prop({ type: Object })
  financials!: Record<string, any>;
}

export const DartFundamentalSchema = SchemaFactory.createForClass(DartFundamental);
