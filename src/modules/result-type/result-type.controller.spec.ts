import { Test, TestingModule } from '@nestjs/testing';
import { ResultTypeController } from './result-type.controller';

describe('ResultTypeController', () => {
  let controller: ResultTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultTypeController],
    }).compile();

    controller = module.get<ResultTypeController>(ResultTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
