import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NasdaqStockSymbol extends Document {
  @Prop({ required: true, unique: true })
  symbol!: string;
}

export const NasdaqStockSymbolSchema = SchemaFactory.createForClass(NasdaqStockSymbol);
