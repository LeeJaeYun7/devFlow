import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import type {
  YahooDefaultKeyStatistics,
  YahooSummaryDetail,
  YahooFinancialData,
} from '../interfaces/yahoo-stock-info-interface';

@Schema({ timestamps: true })
export class YahooStockInfo extends Document {
  @Prop({ type: Types.ObjectId, auto: true })
  override _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  symbol!: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  summaryDetail?: YahooSummaryDetail;

  @Prop({ type: MongooseSchema.Types.Mixed })
  defaultKeyStatistics?: YahooDefaultKeyStatistics;

  @Prop({ type: MongooseSchema.Types.Mixed })
  financialData?: YahooFinancialData;

  @Prop({ type: Date, default: Date.now })
  lastUpdated!: Date;

  @Prop({ type: Date })
  expiresAt!: Date;
}

export const YahooStockInfoSchema = SchemaFactory.createForClass(YahooStockInfo);

YahooStockInfoSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });