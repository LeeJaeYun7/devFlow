import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { YahooStockNewsItem } from '../interfaces/yahoo-stock-news-interface';

@Schema({ timestamps: true })
export class YahooStockNews extends Document {
  @Prop({ required: true, index: true })
  symbol!: string;

  @Prop({ type: [Object] })
  news!: YahooStockNewsItem[];

  @Prop()
  lastUpdated!: Date;
}

export const YahooStockNewsSchema = SchemaFactory.createForClass(YahooStockNews);
