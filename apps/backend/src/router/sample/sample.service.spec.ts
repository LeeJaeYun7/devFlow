import { Test, TestingModule } from '@nestjs/testing';
import { SampleService } from './sample.service';

describe('SampleService', () => {
  let service: SampleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SampleService],
    }).compile();

    service = module.get<SampleService>(SampleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return sample data with given id', async () => {
      const dto = { id: 'test-id' };
      const result = await service.get(dto);

      expect(result).toEqual({
        id: dto.id,
        numData: 1,
      });
    });
  });
});
