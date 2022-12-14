import { Test, TestingModule } from '@nestjs/testing';
import { EmissionRecordProducerService } from './emission-record-producer.service';

describe('EmissionRecordProducerService', () => {
  let service: EmissionRecordProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmissionRecordProducerService],
    }).compile();

    service = module.get<EmissionRecordProducerService>(EmissionRecordProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
