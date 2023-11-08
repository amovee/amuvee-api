import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Result, ResultDocument } from 'src/shared/schemas/result.schema';
import mongoose, { PipelineStage } from 'mongoose';
import { Model } from 'mongoose';
import { Region, RegionDocument } from 'src/shared/schemas/region.schema';
import { Action, ActionDocument } from 'src/shared/schemas/action.schema';
import { QueryFilterDTO } from 'src/shared/dtos/query-filter.dto';
import { MinResultDTO, ResultDTO } from 'src/shared/dtos/results.dto';
import {
  getVariationProjection,
  lookUpInVariation,
  mongoDBFiltersFromQueryFilter,
  unwind,
} from './helper.functions';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
  ) {}

  async getRegionsByZip(zip: string): Promise<Region[]> {
    const regions: Region[] = await this.regionModel
      .find<Region>({
        zips: { $regex: zip },
      })
      .select('_id');
    return regions;
  }
  async getMongoDBFilters(query: QueryFilterDTO) {
    let regions: mongoose.Types.ObjectId[] = null;
    if (query.zip) {
      regions = (await this.getRegionsByZip(query.zip)).map(
        (region: Region) => new mongoose.Types.ObjectId(region._id.toString()),
      );
    }
    return mongoDBFiltersFromQueryFilter(query, regions);
  }
  async getResultFromId(
    id: string | number,
    language?: string,
  ): Promise<ResultDTO | undefined> {
    const idMatch = isNaN(+id)
      ? { _id: new mongoose.Types.ObjectId(id) }
      : { id: +id };
    const request: PipelineStage[] = [
      {
        $match: idMatch,
      },
      {
        $unwind: '$variations',
      },
      lookUpInVariation('actions'),
      lookUpInVariation('locations'),
      {
        $lookup: {
          from: 'resulttypes',
          localField: 'type',
          foreignField: '_id',
          as: 'type',
        },
      },
      {
        $addFields: {
          type: { $arrayElemAt: ['$type', 0] },
        },
      },
      {
        $group: {
          _id: '$_id',
          id: { $first: '$id' },
          name: { $first: '$name' },
          type: { $first: '$type' },
          status: { $first: '$status' },
          specific: { $first: '$specific' },
          roles: { $first: '$roles' },
          categories: { $first: '$categories' },
          variations: { $push: '$variations' },
        },
      },
      {
        $sort: { id: 1 },
      },
    ];
    const list: ResultDTO[] = await this.resultModel
      .aggregate<ResultDTO>(request)
      .limit(1);
    if (list.length === 0) return;
    return list[0];
  }
  async getAllFromCategory(
    id: string,
    language?: string,
  ): Promise<ResultDTO[]> {
    return (
      await this.resultModel.aggregate([
        {
          $match: {
            categories: { $in: [new mongoose.Types.ObjectId(id)] },
          },
        },
        lookUpInVariation('actions'),
        lookUpInVariation('locations'),
      ])
    ).map((result) => this.parseResult(result, language));
  }
  async getMinifiedResults(
    limit: number,
    skip: number,
    query: QueryFilterDTO,
  ): Promise<MinResultDTO[]> {
    const filters = await this.getMongoDBFilters(query);
    return (
      await this.resultModel
        .aggregate<MinResultDTO>([
          unwind('$variations'),
          {
            $match: filters,
          },
          {
            $lookup: {
              from: 'resulttypes',
              localField: 'type',
              foreignField: '_id',
              as: 'type',
            },
          },
          unwind('$type'),
          { $project: getVariationProjection('min') },
          lookUpInVariation('actions'),
          lookUpInVariation('locations'),
          {
            $project: {
              'actions.specific': 0,
              'actions.status': 0,
              'actions.roles': 0,
              'locations.status': 0,
              'locations.roles': 0,
            },
          },
          { $sort: { ['type.weight']: -1 } },
        ])
        .skip(skip)
        .limit(limit)
    ).map((res: MinResultDTO) => {
      return res;
      // return filterResultLanguage(res, query.language);
    });
  }
  async getMinifiedResultsByIdList(
    language: string,
    idList: string[],
  ): Promise<ResultDTO[]> {
    const request: PipelineStage[] = [
      // { $project: getVariationProjection() },
      {
        $unwind: '$variations',
      },
      lookUpInVariation('actions'),
      lookUpInVariation('locations'),
      {
        $lookup: {
          from: 'resulttypes',
          localField: 'type',
          foreignField: '_id',
          as: 'type',
        },
      },
      {
        $match: {
          $or: [
            {
              _id: { $in: idList.map((id) => new mongoose.Types.ObjectId(id)) },
            },
            {
              'variations._id': {
                $in: idList.map((id) => new mongoose.Types.ObjectId(id)),
              },
            },
          ],
        },
      },
      {
        $addFields: {
          type: { $arrayElemAt: ['$type', 0] },
        },
      },
      {
        $group: {
          _id: '$_id',
          id: { $first: '$id' },
          name: { $first: '$name' },
          type: { $first: '$type' },
          status: { $first: '$status' },
          specific: { $first: '$specific' },
          roles: { $first: '$roles' },
          categories: { $first: '$categories' },
          variations: { $push: '$variations' },
        },
      },
      {
        $sort: { id: 1 },
      },
    ];
    return await this.resultModel.aggregate<ResultDTO>(request);
  }

  async getUnwindedVariations(
    limit: number,
    skip: number,
    query: QueryFilterDTO,
  ): Promise<ResultDTO[]> {
    const filters = await this.getMongoDBFilters(query);
    return await this.resultModel
      .aggregate<ResultDTO>([
        unwind('$variations'),
        {
          $match: filters,
        },
        { $project: getVariationProjection() },
        lookUpInVariation('actions'),
        lookUpInVariation('locations'),
        {
          $lookup: {
            from: 'resulttypes',
            localField: 'type',
            foreignField: '_id',
            as: 'type',
          },
        },
        unwind('$type'),
        { $sort: { ['type.weight']: -1 } },
      ])
      .skip(skip)
      .limit(limit);
  }
  async getFilteredResults(
    limit: number,
    skip: number,
    query: QueryFilterDTO,
  ): Promise<ResultDTO[]> {
    const filters = await this.getMongoDBFilters(query);
    const request: PipelineStage[] = [
      {
        $match: filters,
      },
      // { $project: getVariationProjection() },
      {
        $unwind: '$variations',
      },
      lookUpInVariation('actions'),
      lookUpInVariation('locations'),
      {
        $lookup: {
          from: 'resulttypes',
          localField: 'type',
          foreignField: '_id',
          as: 'type',
        },
      },
      {
        $addFields: {
          type: { $arrayElemAt: ['$type', 0] },
        },
      },
      {
        $group: {
          _id: '$_id',
          id: { $first: '$id' },
          name: { $first: '$name' },
          type: { $first: '$type' },
          status: { $first: '$status' },
          specific: { $first: '$specific' },
          roles: { $first: '$roles' },
          categories: { $first: '$categories' },
          variations: { $push: '$variations' },
        },
      },
      {
        $sort: { id: 1 },
      },
    ];

    return await this.resultModel
      .aggregate<ResultDTO>(request)
      .skip(skip)
      .limit(limit);
  }
  async getCounter(query: QueryFilterDTO): Promise<any> {
    const filters = await this.getMongoDBFilters(query);
    const total = await this.resultModel.aggregate([
      { $match: filters },
      {
        $count: 'total',
      },
    ]);
    return total.length ? total[0] : { total: 0 };
  }
  async getFilteredResultCount(query: QueryFilterDTO): Promise<number> {
    const filters = await this.getMongoDBFilters(query);
    return await this.resultModel.count(filters).exec();
  }

  parseAction(action: any, language?: string) {
    if (!language) {
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
    if (!language) {
      return content;
    }
    if (!content[language] && language != 'de') {
      return { de: content['de'] };
    }
    return { [language]: content[language] };
  }
  parseResult(tmp: any, language?: string): ResultDTO {
    const actions = tmp.actions.map((action) =>
      this.parseAction(action, language),
    );
    return null;
  }
}
