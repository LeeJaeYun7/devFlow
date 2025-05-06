import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model, Types } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMetricService } from './user_metric.service';
import { UserModel, UserSchema } from '../mongo/model/user.model';
import { DailyMetricModel, DailyMetricSchema } from '../mongo/model/metric/daily_metric.model';
import { TotalMetricModel, TotalMetricSchema } from '../mongo/model/metric/total_metric.model';
import { DauMetricModel, DauMetricSchema } from '../mongo/model/metric/dau.model';
import { DailyMetricMap, TotalMetricMap } from '../mongo/model/metric/metric.constant';
import { AuthSsoMap } from '@lia/api/auth/auth.constant';

describe('UserMetricService', () => {
  let service: UserMetricService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<UserModel>;
  let dailyMetricModel: Model<DailyMetricModel>;
  let totalMetricModel: Model<TotalMetricModel>;
  let dauMetricModel: Model<DauMetricModel>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(UserModel.name, UserSchema);
    dailyMetricModel = mongoConnection.model(DailyMetricModel.name, DailyMetricSchema);
    totalMetricModel = mongoConnection.model(TotalMetricModel.name, TotalMetricSchema);
    dauMetricModel = mongoConnection.model(DauMetricModel.name, DauMetricSchema);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        MongooseModule.forFeature([
          { name: UserModel.name, schema: UserSchema },
          { name: DailyMetricModel.name, schema: DailyMetricSchema },
          { name: TotalMetricModel.name, schema: TotalMetricSchema },
          { name: DauMetricModel.name, schema: DauMetricSchema },
        ]),
      ],
      providers: [UserMetricService],
    }).compile();

    service = module.get<UserMetricService>(UserMetricService);
  });

  afterEach(async () => {
    await mongoConnection.dropDatabase();
  });

  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('createNewUser', () => {
    it('새로운 유저 생성 시 metric이 증가해야 한다', async () => {
      const userId = new Types.ObjectId();
      await service.createNewUser(userId.toString());

      const dailyMetric = await dailyMetricModel.findOne({ metric: DailyMetricMap.nru });
      const totalMetric = await totalMetricModel.findOne({ metric: TotalMetricMap.totalUser });
      const dauMetric = await dauMetricModel.findOne({ userId });

      expect(dailyMetric).toBeTruthy();
      expect(totalMetric).toBeTruthy();
      expect(dauMetric).toBeTruthy();
    });
  });

  describe('accessToday', () => {
    it('오늘 접속 기록이 생성되어야 한다', async () => {
      const userId = new Types.ObjectId();
      await service.accessToday(userId.toString());

      const dauMetric = await dauMetricModel.findOne({ userId });
      expect(dauMetric).toBeTruthy();
    });
  });

  describe('updateDailyMetric', () => {
    it('어제 접속 기록이 생성되어야 한다', async () => {
      await userModel.create({
        _id: new Types.ObjectId(),
        email: 'test@test.com',
        provider: AuthSsoMap.naver,
        providerId: 'test',
        createdAt: new Date(),
      });

      await service.updateDailyMetric();

      const dauMetric = await dailyMetricModel.findOne({ metric: DailyMetricMap.dau });
      const totalUserMetric = await dailyMetricModel.findOne({ metric: DailyMetricMap.totalUser });
      const d1RetentionMetric = await dailyMetricModel.findOne({ metric: DailyMetricMap.d1Retention });
      const d7RetentionMetric = await dailyMetricModel.findOne({ metric: DailyMetricMap.d7Retention });

      expect(dauMetric?.value).toBe(0);
      expect(totalUserMetric?.value).toBe(1);
      expect(d1RetentionMetric?.value).toBe(0);
      expect(d7RetentionMetric?.value).toBe(0);
    });
  });
});
