import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type {
  RecommendationTrend,
  Earnings,
  EarningsTrend,
  EarningsHistory,
} from '../interfaces/yahoo-stock-analysis-interface';

@Schema({ timestamps: true })
export class YahooStockAnalysis extends Document {
  @Prop({ required: true, index: true })
  symbol!: string;

  @Prop({ type: Object })
  recommendationTrend!: RecommendationTrend;

  @Prop({ type: Object })
  earnings!: Earnings;

  @Prop({ type: Object })
  earningsTrend!: EarningsTrend;

  @Prop({ type: Object })
  earningsHistory!: EarningsHistory;
}

export const YahooStockAnalysisSchema = SchemaFactory.createForClass(YahooStockAnalysis);
