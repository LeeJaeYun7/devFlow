import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { UserModel, UserSchema } from '../../module/mongo/model/user/models/user.model';
import { AuthSsoMap } from '@lia/api/auth/auth.constant';
import { MetricModule } from '../../module/metric/metric.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '../../constants/jwt.constant';
import { UserMessageQuotaModel } from '../../module/mongo/model/user/models/user_message_quota.model';
import { UserMessageQuotaSchema } from '../../module/mongo/model/user/models/user_message_quota.model';
import { DEFAULT_MESSAGE_QUOTA } from '../../constants/message.constant';

describe('AuthService', () => {
  let service: AuthService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<UserModel>;
  let jwtService: JwtService;
  let userMessageQuotaModel: Model<UserMessageQuotaModel>;
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(UserModel.name, UserSchema);
    userMessageQuotaModel = mongoConnection.model(UserMessageQuotaModel.name, UserMessageQuotaSchema);
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: UserMessageQuotaModel.name, schema: UserMessageQuotaSchema }]),
        MetricModule,
        JwtModule.register({
          secret: JWT_SECRET,
        }),
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
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

      expect(result).toBeDefined();
      const decoded = jwtService.verify(result);
      expect(decoded.email).toBe(ssoUser.email);
      expect(decoded.provider).toBe(ssoUser.provider);
      expect(decoded.name).toBe(ssoUser.name);

      // 생성 이후 메시지 할당량 확인
      const userMessageQuota = await userMessageQuotaModel.findOne({ userId: decoded.id });
      expect(userMessageQuota).toBeDefined();
      expect(userMessageQuota?.remainingChats).toBe(DEFAULT_MESSAGE_QUOTA);
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

      expect(result).toBeDefined();
      const decoded = jwtService.verify(result);
      expect(decoded.email).toBe(existingUser.email);
      expect(decoded.provider).toBe(existingUser.provider);
      expect(decoded.name).toBe(existingUser.name);
    });
  });
});
