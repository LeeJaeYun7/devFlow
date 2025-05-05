import { Module } from '@nestjs/common';
import { SystemPromptController } from './system_prompt.controller';
import { SystemPromptService } from './system_prompt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemCharacterModel, SystemCharacterSchema } from '../../../module/mongo/model/system_character.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: SystemCharacterModel.name, schema: SystemCharacterSchema }])],
  controllers: [SystemPromptController],
  providers: [SystemPromptService],
  exports: [SystemPromptService],
})
export class SystemPromptModule {}
