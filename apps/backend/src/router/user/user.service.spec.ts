import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model, Types } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserModel, UserSchema } from '../../module/mongo/model/user.model';
import { UserMessageQuotaModel, UserMessageQuotaSchema } from '../../module/mongo/model/user_message_quota.model';
import { CustomRequestContextService } from '../../module/custom_request_context/custom_request_context.service';
import { UserError } from '../../util/base.error';
import { AuthSsoMap } from '@lia/api/auth/auth.constant';

const mockUserId = new Types.ObjectId();
const mockUser = {
  id: mockUserId.toString(),
  email: 'mock@example.com',
  provider: AuthSsoMap.google,
  name: 'Mock User',
};

describe('UserService', () => {
  let service: UserService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<UserModel>;
  let userMessageQuotaModel: Model<UserMessageQuotaModel>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(UserModel.name, UserSchema);
    userMessageQuotaModel = mongoConnection.model(UserMessageQuotaModel.name, UserMessageQuotaSchema);

    const mockCustomRequestContextService = {
      get: jest.fn((key: string) => {
        if (key === 'user') return mockUser;
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri }),
        }),
        MongooseModule.forFeature([
          { name: UserModel.name, schema: UserSchema },
          { name: UserMessageQuotaModel.name, schema: UserMessageQuotaSchema },
        ]),
      ],
      providers: [
        UserService,
        { provide: CustomRequestContextService, useValue: mockCustomRequestContextService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    await userModel.deleteMany({});
    await userMessageQuotaModel.deleteMany({});
    jest.clearAllMocks();
  });

  it('정상적으로 내 정보를 반환해야 한다', async () => {
    await userModel.create({
      _id: mockUserId,
      email: mockUser.email,
      provider: mockUser.provider,
      providerId: 'mock-provider-id',
      name: mockUser.name,
    });
    await userMessageQuotaModel.create({
      userId: mockUserId,
      remainingChats: 42,
      lastReset: new Date(),
    });

    const result = await service.getMySelf({});
    expect(result).toEqual({
      name: mockUser.name,
      email: mockUser.email,
      provider: mockUser.provider,
      remainMessageQuota: 42,
    });
  });

  it('유저가 존재하지 않으면 예외를 던진다', async () => {
    await expect(service.getMySelf({})).rejects.toThrow(UserError);
  });

  it('메시지 쿼터가 없으면 remainMessageQuota가 0이어야 한다', async () => {
    await userModel.create({
      _id: mockUserId,
      email: mockUser.email,
      provider: mockUser.provider,
      providerId: 'mock-provider-id',
      name: mockUser.name,
    });
    // 메시지 쿼터 생성 안 함
    const result = await service.getMySelf({});
    expect(result).toEqual({
      name: mockUser.name,
      email: mockUser.email,
      provider: mockUser.provider,
      remainMessageQuota: 0,
    });
  });
});
