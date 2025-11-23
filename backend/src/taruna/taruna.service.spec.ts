import { Test, TestingModule } from '@nestjs/testing';
import { TarunaService } from './taruna.service';

describe('TarunaService', () => {
  let service: TarunaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TarunaService],
    }).compile();

    service = module.get<TarunaService>(TarunaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
