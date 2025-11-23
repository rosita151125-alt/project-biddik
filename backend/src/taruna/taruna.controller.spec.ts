import { Test, TestingModule } from '@nestjs/testing';
import { TarunaController } from './taruna.controller';

describe('TarunaController', () => {
  let controller: TarunaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarunaController],
    }).compile();

    controller = module.get<TarunaController>(TarunaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
