import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NaverStockHistoryItem } from '../interfaces/naver-stock-history-interface';

@Schema({ timestamps: true })
export class NaverStockHistory extends Document {
  @Prop({ required: true })
  symbol!: string;

  @Prop({ required: true })
  interval!: string;

  @Prop({ type: Object, required: true })
  data!: NaverStockHistoryItem[];

  @Prop({ required: false })
  marketCap?: number;

  @Prop({ required: false })
  high52Week?: number;

  @Prop({ required: false })
  low52Week?: number;

  @Prop({ required: true })
  lastUpdated!: Date;
}

export const NaverStockHistorySchema = SchemaFactory.createForClass(NaverStockHistory); 