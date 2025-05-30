import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import type {
  NaverDefaultKeyStatistics,
  NaverSummaryDetail,
  NaverFinancialData,
} from '../interfaces/naver-stock-info-interface';

@Schema({ timestamps: true })
export class NaverStockInfo extends Document {
  @Prop({ type: Types.ObjectId, auto: true })
  override _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  symbol!: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  summaryDetail?: NaverSummaryDetail;

  @Prop({ type: MongooseSchema.Types.Mixed })
  defaultKeyStatistics?: NaverDefaultKeyStatistics;

  @Prop({ type: MongooseSchema.Types.Mixed })
  financialData?: NaverFinancialData;
}

export const NaverStockInfoSchema = SchemaFactory.createForClass(NaverStockInfo);
