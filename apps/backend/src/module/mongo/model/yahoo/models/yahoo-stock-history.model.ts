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

  @Prop({ required: true })
  expiresAt!: Date;
}

export const YahooStockHistorySchema = SchemaFactory.createForClass(YahooStockHistory);

// TTL 인덱스 추가 (expiresAt 필드 기준으로 자동 삭제)
YahooStockHistorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 복합 인덱스 추가 (symbol과 interval로 빠른 조회)
YahooStockHistorySchema.index({ symbol: 1, interval: 1 });
