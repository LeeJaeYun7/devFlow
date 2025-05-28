import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class KoreaStockSymbol extends Document {
  @Prop({ required: true, unique: true })
  symbol!: string;

  @Prop()
  market?: 'KOSPI' | 'KOSDAQ';
}

export const KoreaStockSymbolSchema = SchemaFactory.createForClass(KoreaStockSymbol);
