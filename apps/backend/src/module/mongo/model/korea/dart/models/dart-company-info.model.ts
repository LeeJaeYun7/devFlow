import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DartCompanyInfo extends Document {
  @Prop({ required: true })
  corpCode!: string;

  @Prop({ required: true })
  stockCode!: string;

  @Prop()
  bsnsYear?: number; // 연도별 데이터 (예: 2015 ~ 2025)

  @Prop()
  reprtCode?: string; // 분기보고서 코드 (11013, 11012, 11014, 11011)

  @Prop({ type: Object })
  financials?: any; // 분기별 실적 리스트
}

export const DartCompanyInfoSchema = SchemaFactory.createForClass(DartCompanyInfo);
