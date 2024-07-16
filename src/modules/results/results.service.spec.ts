import { Test, TestingModule } from '@nestjs/testing';
import { ResultsService } from './results.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { QueryFilterDTO } from 'src/shared/dtos/query-filter.dto';
import { CounterService } from 'src/modules/counters/counters.service';

interface ResultDocument extends Document {
  id: number;
  name: string;
  type: mongoose.Types.ObjectId;
  status: string;
  roles: any;
  categories: mongoose.Types.ObjectId[];
  variations: any[];
  createdAt: Date;
  updatedAt: Date;
}

// Mock models and services
const mockModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  exec: jest.fn(),
};

const mockCounterService = {
  getNextSequenceValue: jest.fn(),
  deleteSequenzDocument: jest.fn(),
  setMaxSequenceValue: jest.fn(),
};

describe('ResultsService', () => {
  let service: ResultsService;
  let mongod: MongoMemoryServer;
  let resultModel: Model<ResultDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.connect(uri);

    const resultSchema = new Schema<ResultDocument>({
      id: { type: Number, required: true },
      name: { type: String, required: true },
      type: { type: Schema.Types.ObjectId, ref: 'ResultTypeDTO', required: true },
      status: { type: String, required: true },
      roles: { type: Object, required: true },
      categories: { type: [Schema.Types.ObjectId], ref: 'CategoryDTO', default: [] },
      variations: { type: [Object], default: [] },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    resultModel = mongoose.model<ResultDocument>('Result', resultSchema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultsService,
        {
          provide: getModelToken('Result'),
          useValue: resultModel,
        },
        {
          provide: getModelToken('Region'),
          useValue: mockModel,
        },
        {
          provide: getModelToken('Action'),
          useValue: mockModel,
        },
        {
          provide: getModelToken('User'),
          useValue: mockModel,
        },
        {
          provide: getModelToken('MinResult'),
          useValue: mockModel, // Provide mock for MinResultModel
        },
        {
          provide: CounterService,
          useValue: mockCounterService,
        },
      ],
    }).compile();

    service = module.get<ResultsService>(ResultsService);

    await resultModel.create([
      {
        id: 1,
        name: 'Result 1',
        type: new mongoose.Types.ObjectId(),
        status: 'PUBLISHED',
        roles: {},
        categories: [],
        variations: [
          {
            title: { de: 'Titel 1', en: 'Title 1' },
            shortDescription: { de: 'Beschreibung 1', en: 'Description 1' },
            description: { de: 'Beschreibung 1', en: 'Description 1' },
            actions: [],
            locations: [],
            filters: [],
            amountOfMoney: { min: 100, max: 500 },
            timespan: { start: new Date(), end: new Date() },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Result 2',
        type: new mongoose.Types.ObjectId(),
        status: 'PUBLISHED',
        roles: {},
        categories: [],
        variations: [
          {
            title: { de: 'Titel 2' },
            shortDescription: { de: 'Beschreibung 2' },
            description: { de: 'Beschreibung 2' },
            actions: [],
            locations: [],
            filters: [],
            amountOfMoney: { min: 200, max: 600 },
            timespan: { start: new Date(), end: new Date() },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: 'Result 3',
        type: new mongoose.Types.ObjectId(),
        status: 'PUBLISHED',
        roles: {},
        categories: [],
        variations: [
          {
            title: { de: 'Titel 3', fr: 'Titre 3' },
            shortDescription: { de: 'Beschreibung 3', fr: 'Description 3' },
            description: { de: 'Beschreibung 3', fr: 'Description 3' },
            actions: [],
            locations: [],
            filters: [],
            amountOfMoney: { min: 300, max: 700 },
            timespan: { start: new Date(), end: new Date() },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

  });

  afterEach(async () => {
    await resultModel.deleteMany({});
  });

  it('should filter results by includedLanguages and excludedLanguages ', async () => {
    const insertedDocs = await resultModel.find();
    expect(insertedDocs).toHaveLength(3);

    const query: QueryFilterDTO = {
      includedLanguages: ['de'],
      limit: 10,
      skip: 0,
    };

    const results = await service.getFilteredResults(query.limit, query.skip, query);
    expect(results).toHaveLength(3); // Adjust this based on your test data
    expect(results[0].variations[0].title.de).toBe('Titel 1');
    expect(results[1].variations[0].title.de).toBe('Titel 2');
    expect(results[2].variations[0].title.de).toBe('Titel 3');
  });

  it('should filter results by excludedLanguages', async () => {
    const query: QueryFilterDTO = {
      excludedLanguages: ['fr'],
      limit: 10,
      skip: 0,
    };

    const results = await service.getFilteredResults(query.limit, query.skip, query);
    expect(results).toHaveLength(2); // Adjust this based on your test data
    expect(results[0].variations[0].title.de).toBe('Titel 1');
    expect(results[1].variations[0].title.de).toBe('Titel 2');
  });

  it('should limit the number of results', async () => {
    const query: QueryFilterDTO = {
      limit: 2,
      skip: 0,
    };

    const results = await service.getFilteredResults(query.limit, query.skip, query);
    expect(results).toHaveLength(2);
  });

  it('should skip the specified number of results', async () => {
    const query: QueryFilterDTO = {
      limit: 10,
      skip: 1,
    };

    const results = await service.getFilteredResults(query.limit, query.skip, query);
    expect(results).toHaveLength(2); // Adjust this based on your test data
    expect(results[0].variations[0].title.de).toBe('Titel 2');
    expect(results[1].variations[0].title.de).toBe('Titel 3');
  });

  it('should filter results by search term', async () => {
    const query: QueryFilterDTO = {
      limit: 10,
      skip: 0,
    };
    const search = 'Result 2';

    const results = await service.getFilteredResults(query.limit, query.skip, query, search);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Result 2');
  });
});
