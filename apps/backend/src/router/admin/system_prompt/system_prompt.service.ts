import { SystemPromptGetDto, SystemPromptGetResponse } from '@lia/api/admin/system_prompt/get.dto';
import { SystemPromptPatchDto, SystemPromptPatchResponse } from '@lia/api/admin/system_prompt/patch.dto';
import { ServiceReturnType } from '@lia/api/types/base.type';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SystemCharacterModel } from '../../../module/mongo/model/system_character.model';
import { Model } from 'mongoose';

@Injectable()
export class SystemPromptService implements OnModuleInit {
  private readonly defaultCharacter = 'Lia';

  constructor(
    @InjectModel(SystemCharacterModel.name)
    private readonly systemCharacterModel: Model<SystemCharacterModel>
  ) {}

  public async onModuleInit() {
    const lia = await this.systemCharacterModel.findOne({ name: this.defaultCharacter });
    if (!lia) {
      await this.systemCharacterModel.create({
        name: this.defaultCharacter,
        description: 'Lia is a helpful assistant.',
        image: 'https://example.com/lia.png',
        systemPrompt: 'You are a helpful assistant.',
      });
    }
  }

  public async get(_: SystemPromptGetDto): Promise<ServiceReturnType<SystemPromptGetResponse>> {
    const lia = await this.systemCharacterModel.findOne({ name: this.defaultCharacter });

    if (!lia) {
      throw new Error('Lia not found');
    }

    return {
      systemPrompt: lia.systemPrompt,
    };
  }

  public async patch(dto: SystemPromptPatchDto): Promise<ServiceReturnType<SystemPromptPatchResponse>> {
    const lia = await this.systemCharacterModel.findOne({ name: this.defaultCharacter });
    if (!lia) {
      throw new Error('Lia not found');
    }

    lia.systemPrompt = dto.systemPrompt;
    await lia.save();
  }
}
