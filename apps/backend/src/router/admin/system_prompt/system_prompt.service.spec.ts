import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemPromptService } from './system_prompt.service';
import { SystemCharacterModel, SystemCharacterSchema } from '../../../module/mongo/model/system_character.model';

describe('SystemPromptService', () => {
  let service: SystemPromptService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let systemCharacterModel: Model<SystemCharacterModel>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    systemCharacterModel = mongoConnection.model(SystemCharacterModel.name, SystemCharacterSchema);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        MongooseModule.forFeature([{ name: SystemCharacterModel.name, schema: SystemCharacterSchema }]),
      ],
      providers: [SystemPromptService],
    }).compile();

    service = module.get<SystemPromptService>(SystemPromptService);
  });

  afterEach(async () => {
    await mongoConnection.dropDatabase();
  });

  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('onModuleInit', () => {
    it('기본 캐릭터가 없을 경우 생성해야 합니다', async () => {
      await service.onModuleInit();

      const lia = await systemCharacterModel.findOne({ name: 'Lia' });
      expect(lia).toBeDefined();
      expect(lia?.description).toBe('Lia is a helpful assistant.');
      expect(lia?.image).toBe('https://example.com/lia.png');
      expect(lia?.systemPrompt).toBe('You are a helpful assistant.');
    });
  });

  describe('get', () => {
    it('기본 캐릭터의 시스템 프롬프트를 반환해야 합니다', async () => {
      const lia = await systemCharacterModel.create({
        name: 'Lia',
        description: 'Test description',
        image: 'test.png',
        systemPrompt: 'Test prompt',
      });

      const result = await service.get({});

      expect(result.systemPrompt).toBe(lia.systemPrompt);
    });

    it('기본 캐릭터가 없을 경우 에러를 발생시켜야 합니다', async () => {
      await expect(service.get({})).rejects.toThrow('Lia not found');
    });
  });

  describe('patch', () => {
    it('기본 캐릭터의 시스템 프롬프트를 수정해야 합니다', async () => {
      await systemCharacterModel.create({
        name: 'Lia',
        description: 'Test description',
        image: 'test.png',
        systemPrompt: 'Original prompt',
      });

      const newPrompt = 'Updated prompt';
      await service.patch({ systemPrompt: newPrompt });

      const updated = await systemCharacterModel.findOne({ name: 'Lia' });
      expect(updated?.systemPrompt).toBe(newPrompt);
    });

    it('기본 캐릭터가 없을 경우 에러를 발생시켜야 합니다', async () => {
      await expect(service.patch({ systemPrompt: 'test' })).rejects.toThrow('Lia not found');
    });
  });
});
