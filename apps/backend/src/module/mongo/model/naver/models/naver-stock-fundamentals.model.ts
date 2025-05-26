import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NaverStockFundamentals extends Document {
  @Prop({ required: true, index: true })
  symbol!: string;

  @Prop({ type: Object })
  data!: any;

  @Prop()
  lastUpdated!: Date;

  @Prop()
  expiresAt!: Date;
}

export const NaverStockFundamentalsSchema = SchemaFactory.createForClass(NaverStockFundamentals);

NaverStockFundamentalsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
