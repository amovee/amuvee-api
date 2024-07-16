import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ResultTypeController } from './result-type.controller';
import {UsersService} from "../users/users.service";
import {RightsGuard} from "../auth/rights/rights.guard";
import {ResultTypeService} from "./result-type.service";

describe('ResultTypeController', () => {
  let controller: ResultTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultTypeController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ResultTypeService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },

        {
          provide: Reflector,
          useValue: {}, // Provide a mock or real implementation as needed
        },
        {
          provide: RightsGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true), // Mock the guard's method
          },
        },
        // Add any other providers your controller depends on
      ],
    }).compile();


    controller = module.get<ResultTypeController>(ResultTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
