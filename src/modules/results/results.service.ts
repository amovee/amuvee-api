import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Filter, Result, ResultDocument } from './result.schema';
import mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Region, RegionDocument } from '../../schemas/region.schema';
import { Action, ActionDocument } from '../actions/action.schema';
import { QueryFilterDTO } from 'src/types/types.dto';
import { getFormattedResultDTO } from './results.dto';
import { lookUp, mongoDBFiltersFromQueryFilter } from './filter.parser';
import getType from './result.migration';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
  ) {}

  async getRegions(zip: string) {
    const regions: any[] = await this.regionModel
      .find({
        zips: { $elemMatch: { $eq: zip } },
      })
      .select('_id');
    for (let i = 0; i < regions.length; i++) {
      regions[i] = regions[i]._id;
    }
    return regions;
  }
  async getMongoDBFilters(query: QueryFilterDTO) {
    await mongoDBFiltersFromQueryFilter(
      query,
      await this.getRegions(query.zip),
    );
  }

  async getResultFromId(
    id: string,
    language?: string,
  ): Promise<getFormattedResultDTO> {
    const result: Result = await this.resultModel
      .findById(id)
      .populate('actions')
      .populate('locations');
    return this.parseResult(result, language);
  }
  async getAllFromCategory(
    id: string,
    language?: string,
  ): Promise<getFormattedResultDTO[]> {
    return (
      await this.resultModel.aggregate([
        {
          $match: {
            categories: { $in: [new mongoose.Types.ObjectId(id)] },
          },
        },
        lookUp('actions'),
        lookUp('locations'),
      ])
    ).map((result) => this.parseResult(result, language));
  }
  async getAll(
    limit: number,
    skip: number,
    query: QueryFilterDTO,
  ): Promise<getFormattedResultDTO[]> {
    const filters = await mongoDBFiltersFromQueryFilter(
      query,
      await this.getRegions(query.zip),
    );
    
    return (
      await this.resultModel
        .aggregate([
          {
            $match: filters,
          },
          lookUp('actions'),
          lookUp('locations'),
          { $sort: { id: 1 }}
        ])
        .skip(skip)
        .limit(limit)
    ).map((result) => this.parseResult(result, query.language));
  }
  async getCounter(query: QueryFilterDTO): Promise<any> {
    const filters = await mongoDBFiltersFromQueryFilter(
      query,
      await this.getRegions(query.zip),
    );
    return [
      await this.resultModel.aggregate([
        {
          $match: filters,
        },
        {
          $count: 'counter',
        },
      ]),
      await this.resultModel.aggregate([
        {
          $count: 'counter',
        },
      ]),
    ];
  }
  async getFilteredResultCount(query: QueryFilterDTO): Promise<number> {
    return await this.resultModel
      .count(
        await mongoDBFiltersFromQueryFilter(
          query,
          await this.getRegions(query.zip),
        ),
      )
      .exec();
  }

  parseAction(action: any, language?: string) {
    if(!language) {
      return {
        id: action._id.toString(),
        content: action.content,
      };
    }
    if (!action.content[language] && language != 'de') {
      return {
        id: action._id.toString(),
        content: { [language]: action.content['de'] },
      };
    }
    
    return {
      id: action._id.toString(),
      content: { [language]: action.content[language] },
    };
  }
  parseResultContent(content: any, language?: string) {
    if(!language) {
      return content;
    }
    if (!content[language] && language != 'de') {
      return { 'de': content['de']};
    }
    return { [language]: content[language]}
  }
  parseResult(tmp: any, language?: string) {
    
    const actions = tmp.actions.map((action) =>
    this.parseAction(action, language),
    );
    return {
      _id: tmp._id.toString(),
      id: +tmp.id,
      content: this.parseResultContent(tmp.content, language),
      locations: tmp.locations,
      amountOfMoney: tmp.amountOfMoney,
      categories: tmp.categories,
      period: { start: null, end: null },
      actions,
      filters: tmp.filters,
      type: getType(tmp.type, language),
    };
  }
}
