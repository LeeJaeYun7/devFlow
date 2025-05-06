import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { UserModel, UserSchema } from '../../module/mongo/model/user.model';
import { AuthSsoMap } from '@lia/api/auth/auth.constant';
import { MetricModule } from '../../module/metric/metric.module';

describe('AuthService', () => {
  let service: AuthService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<UserModel>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(UserModel.name, UserSchema);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
        MetricModule,
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('loginUser', () => {
    it('새로운 사용자를 생성해야 합니다', async () => {
      const ssoUser = {
        provider: AuthSsoMap.google,
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = await service.loginUser(ssoUser);

      expect(result.email).toBe(ssoUser.email);
      expect(result.provider).toBe(ssoUser.provider);
      expect(result.providerId).toBe(ssoUser.id);
      expect(result.name).toBe(ssoUser.name);
    });

    it('이미 존재하는 사용자를 반환해야 합니다', async () => {
      const existingUser = await userModel.create({
        email: 'existing@example.com',
        provider: AuthSsoMap.google,
        providerId: 'existing-id',
        name: 'Existing User',
      });

      const ssoUser = {
        provider: AuthSsoMap.google,
        id: 'new-id',
        email: 'existing@example.com',
        name: 'New Name',
      };

      const result = await service.loginUser(ssoUser);

      expect(result.id).toBe(existingUser.id);
      expect(result.email).toBe(existingUser.email);
      expect(result.provider).toBe(existingUser.provider);
      expect(result.providerId).toBe(existingUser.providerId);
      expect(result.name).toBe(existingUser.name);
    });
  });
});
