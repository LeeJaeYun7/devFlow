import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { type SystemModel, type SystemModelTarget } from '@lia/api/admin/system_model/system_model.constant';

@Schema({ collection: 'system_models', timestamps: true })
export class SystemModelModel extends Document<string> {
  @Prop({ required: true, type: String })
  target!: SystemModelTarget;

  @Prop({ required: true, type: String })
  modelId!: SystemModel;
}

export const SystemModelSchema = SchemaFactory.createForClass(SystemModelModel);
