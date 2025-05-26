import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NaverStockNews extends Document {
  @Prop({ required: true, index: true })
  symbol!: string;

  @Prop({ type: [Object] })
  articles!: any[];

  @Prop()
  lastUpdated!: Date;

  @Prop()
  expiresAt!: Date;
}

export const NaverStockNewsSchema = SchemaFactory.createForClass(NaverStockNews);

NaverStockNewsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
