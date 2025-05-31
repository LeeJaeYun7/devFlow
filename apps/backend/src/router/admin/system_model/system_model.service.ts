import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ServiceReturnType } from '@lia/api/types/base.type';
import { SystemModelListDto, SystemModelListResponse } from '@lia/api/admin/system_model/list.dto';
import { Model } from 'mongoose';
import { SystemModelPatchDto, SystemModelPatchResponse } from '@lia/api/admin/system_model/patch.dto';
import { SystemModelModel } from '../../../module/mongo/model/system_model.model';
import {
  SystemModelTarget,
  SystemModel,
  SystemModelTargetMap,
} from '@lia/api/admin/system_model/system_model.constant';

@Injectable()
export class SystemModelService implements OnModuleInit {
  constructor(
    @InjectModel(SystemModelModel.name)
    private readonly systemModelModel: Model<SystemModelModel>
  ) {}

  public async onModuleInit() {
    const models = await this.systemModelModel.find().lean();

    const titleModel = models.find((model) => model.target === SystemModelTargetMap.title);
    const messageModel = models.find((model) => model.target === SystemModelTargetMap.message);

    if (!titleModel) {
      await this.systemModelModel.create({
        target: SystemModelTargetMap.title,
        modelId: 'openai/gpt-3.5-turbo',
      });
    }

    if (!messageModel) {
      await this.systemModelModel.create({
        target: SystemModelTargetMap.message,
        modelId: 'openai/gpt-4-turbo',
      });
    }
  }

  public async getList(_: SystemModelListDto): ServiceReturnType<SystemModelListResponse> {
    const data = await this.systemModelModel.find().lean();
    const models = data.map((model) => ({
      target: model.target as SystemModelTarget,
      modelId: model.modelId as SystemModel,
    }));

    return { models };
  }

  public async patch(dto: SystemModelPatchDto): ServiceReturnType<SystemModelPatchResponse> {
    await this.systemModelModel.findOneAndUpdate({ target: dto.target }, { modelId: dto.modelId }, { new: true });
  }
}
