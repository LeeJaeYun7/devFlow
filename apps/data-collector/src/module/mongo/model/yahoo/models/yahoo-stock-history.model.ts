import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { YahooStockHistoryItem } from '../interfaces/yahoo-stock-history-interface';

@Schema({ timestamps: true })
export class YahooStockHistory extends Document {
  @Prop({ required: true, index: true })
  symbol!: string;

  @Prop({ required: true, index: true })
  interval!: string;

  @Prop({ type: Object, required: true })
  data!: YahooStockHistoryItem[];

  @Prop({ required: true })
  lastUpdated!: Date;
}

export const YahooStockHistorySchema = SchemaFactory.createForClass(YahooStockHistory);
