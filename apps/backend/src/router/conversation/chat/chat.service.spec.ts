import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model, Types } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatModel, ChatSchema } from '../../../module/mongo/model/conversation/models/chat.model';
import { CustomRequestContextService } from '../../../module/custom_request_context/custom_request_context.service';

const mockUserId = new Types.ObjectId();
const mockUser = {
  id: mockUserId.toString(),
  email: 'mock@example.com',
  name: 'Mock User',
};

describe('ChatService', () => {
  let service: ChatService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let chatModel: Model<ChatModel>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    chatModel = mongoConnection.model(ChatModel.name, ChatSchema);

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
        MongooseModule.forFeature([{ name: ChatModel.name, schema: ChatSchema }]),
      ],
      providers: [ChatService, { provide: CustomRequestContextService, useValue: mockCustomRequestContextService }],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    await chatModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('listChats', () => {
    it('채팅 목록을 정상적으로 반환해야 한다', async () => {
      // Given
      const mockChats = [
        { _id: new Types.ObjectId(), title: 'Chat 1', userId: mockUserId, deleted: false },
        { _id: new Types.ObjectId(), title: 'Chat 2', userId: mockUserId, deleted: false },
      ];
      await chatModel.insertMany(mockChats);

      // When
      const result = await service.listChats({ limit: 10, page: 1 });

      // Then
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(1);
      expect(result.data[0].title).toBe('Chat 1');
      expect(result.data[1].title).toBe('Chat 2');
    });

    it('삭제된 채팅은 목록에서 제외되어야 한다', async () => {
      // Given
      const mockChats = [
        { _id: new Types.ObjectId(), title: 'Chat 1', userId: mockUserId, deleted: false },
        { _id: new Types.ObjectId(), title: 'Chat 2', userId: mockUserId, deleted: true },
      ];
      await chatModel.insertMany(mockChats);

      // When
      const result = await service.listChats({ limit: 10, page: 1 });

      // Then
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].title).toBe('Chat 1');
    });
  });

  describe('createChat', () => {
    it('새로운 채팅을 생성해야 한다', async () => {
      // When
      const result = await service.createChat({});

      // Then
      expect(result.title).toBe('New Chat');
      const savedChat = await chatModel.findById(result.chatId);
      expect(savedChat).toBeTruthy();
      expect(savedChat?.userId.toString()).toBe(mockUserId.toString());
    });
  });

  describe('deleteAllChats', () => {
    it('모든 채팅을 삭제 처리해야 한다', async () => {
      // Given
      const mockChats = [
        { _id: new Types.ObjectId(), title: 'Chat 1', userId: mockUserId, deleted: false },
        { _id: new Types.ObjectId(), title: 'Chat 2', userId: mockUserId, deleted: false },
      ];
      await chatModel.insertMany(mockChats);

      // When
      await service.deleteAllChats({});

      // Then
      const remainingChats = await chatModel.find({ userId: mockUserId, deleted: false });
      expect(remainingChats).toHaveLength(0);
      const deletedChats = await chatModel.find({ userId: mockUserId, deleted: true });
      expect(deletedChats).toHaveLength(2);
    });
  });
});
