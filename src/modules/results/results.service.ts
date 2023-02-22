import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Filter,
  FilterDocument,
  Result,
  ResultDocument,
} from './result.schema';
import mongoose from 'mongoose';
import { Model, ObjectId } from 'mongoose';
import { Region, RegionDocument } from '../../schemas/region.schema';
import { Action, ActionDocument } from '../actions/action.schema';
import { QueryFilterDTO } from 'src/types/types.dto';
import { getFormattedResultDTO } from './results.dto';
import { getFormattedActionDTO } from '../actions/actions.dto';
import { lookUp, mongoDBFiltersFromQueryFilter } from './filter.parser';
import getType from './result.migration';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    @InjectModel(Filter.name) private filterModel: Model<FilterDocument>,
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
    await mongoDBFiltersFromQueryFilter(query, await this.getRegions(query.zip))
  }

  async getResultFilterById(resultId: string): Promise<any[]> {
    const result = await this.resultModel.findOne({ _id: resultId });
    return await this.filterModel.find({
      _id: { $in: result.filters },
    });
  }

  async getResultFromId(
    id: string,
    language: string,
  ): Promise<getFormattedResultDTO> {
    if (!language) language = 'de';
    const result: Result = await this.regionModel
      .findOne({ oldId: id })
      .populate('filters')
      .populate('actions')
      .populate('locations');
    return this.parseResult(result, language);
  }
  async getAllFromCategory(
    id: string,
    language: string,
  ): Promise<getFormattedResultDTO[]> {
    if (!language) language = 'de';
    return (
      await this.resultModel.aggregate([
        lookUp('filters'),
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
    const filters = await mongoDBFiltersFromQueryFilter(query, await this.getRegions(query.zip));

    return (
      await this.resultModel
        .aggregate([
          lookUp('filters'),
          {
            $match: filters,
          },
          lookUp('actions'),
          lookUp('locations'),
        ])
        .skip(skip)
        .limit(limit)
    ).map((result) =>
      {this.parseResult(result, query.language); return this.parseResult(result, query.language)}
    );
  }
  async getFilteredResultCount(query: QueryFilterDTO): Promise<number> {
    return await this.resultModel
      .count(await mongoDBFiltersFromQueryFilter(query, await this.getRegions(query.zip)))
      .exec();
  }

  parseResult(tmp: any, language: string) {
    const content = tmp.content[language] || {};
    const actions = tmp.actions.map((action) => ({
      id: action._id.toString(),
      content: { [language]: action.content[language] || action.content['de'] },
    }));

    return {
      id: tmp._id.toString(),
      oldId: +tmp.oldId,
      content: { [language || 'de']: content },
      locations: tmp.locations,
      amountOfMoney: tmp.amountOfMoney,
      categories: tmp.categories,
      period: { start: null, end: null },
      actions,
      type: getType(tmp.type, language),
    };
  }
}
