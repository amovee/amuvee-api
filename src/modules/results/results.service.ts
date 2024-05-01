import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  MinResult,
  MinResultDocument,
  Result,
  ResultDocument,
} from 'src/shared/schemas/result.schema';
import mongoose, { PipelineStage } from 'mongoose';
import { Model } from 'mongoose';
import { Region, RegionDocument } from 'src/shared/schemas/region.schema';
import { Action, ActionDocument } from 'src/shared/schemas/action.schema';
import { QueryFilterDTO } from 'src/shared/dtos/query-filter.dto';
import {CreateResultDTO, MinResultDTO, ResultDTO} from 'src/shared/dtos/results.dto';
import {
  getVariationProjection,
  lookUpInVariation,
  mongoDBFiltersFromQueryFilter,
  mongoDBMinFiltersFromQueryFilter,
  unwind,
} from './helper.functions';
import { CounterService } from '../counters/counters.service';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { HistoryEventType } from 'src/shared/dtos/roles.dto';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(MinResult.name)
    private minResultModel: Model<MinResultDocument>,
    private readonly counter: CounterService,
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
  async getMinMongoDBFilters(query: QueryFilterDTO) {
    let regions: mongoose.Types.ObjectId[] = null;
    if (query.zip) {
      regions = (await this.getRegionsByZip(query.zip)).map(
        (region: Region) => new mongoose.Types.ObjectId(region._id.toString()),
      );
    }
    return mongoDBMinFiltersFromQueryFilter(query, regions);
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
    const filters = await this.getMinMongoDBFilters(query);
    return (
      await this.minResultModel
        .find<MinResultDTO>( filters ) // TODO: sort by type weight
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
  ): Promise<MinResultDTO[]> {
    return await this.minResultModel.find({
      v_id: {
        $in: idList,
      },
    });
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
        $count: 'totalCount',
      },
    ]);
    return total.length ? total[0] : { totalCount: 0 };
  }
  async getMinCounter(query: QueryFilterDTO): Promise<any> {
    const filters = await this.getMinMongoDBFilters(query);
    const total = await this.minResultModel.aggregate([
      { $match: filters },
      {
        $count: 'totalCount',
      },
    ]);
    return total.length ? total[0] : { totalCount: 0 };
  }
  async getFilteredResultCount(query: QueryFilterDTO): Promise<number> {
    const filters = await this.getMongoDBFilters(query);
    return await this.resultModel.countDocuments(filters).exec();
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


  async minifyAllResults() {
    const Minifiyrequest: PipelineStage[] = [
      {
        $unwind: '$variations',
      },
      { $unwind: "$variations"},
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
      {$unwind: '$type'},
      {
        $lookup:{
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories'
        }
      },
      {
       $group: {
         _id: "$_id",
         doc: { $first: "$$ROOT" },
         variations: { $push: "$variations" }
        }
      },
      {
        $addFields: {
          "doc.variations": "$variations",
        }
      },
      {
        $replaceRoot: {
          newRoot: "$doc"
        }
      },
    ];
    await this.minResultModel.deleteMany().exec();
    const results = await this.resultModel.aggregate<ResultDTO>(
      Minifiyrequest,
    );
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      for (let j = 0; j < result.variations.length; j++) {
        const variation =result.variations[j];
        await new this.minResultModel({
          _id: new mongoose.Types.ObjectId(),
          vid: j,
          v_id: variation._id,
          rid: result.id,
          r_id: result._id,
          title: variation.title,
          shortDescription: variation.shortDescription,
          description: variation.description,
          actions: variation.actions,
          locations: variation.locations,
          filters: variation.filters,
          amountOfMoney: variation.amountOfMoney,
          timespan: variation.timespan,
          type: result.type,
          categories: result.categories,
          status: variation.status,
          updatedAt: result.createdAt,
          createdAt: result.updatedAt,
        }).save();
      }
    }
  }
  async minifyResult(_id) {
    const Minifiyrequest: PipelineStage[] = [
      {
        $unwind: '$variations',
      },
      { $unwind: "$variations"},
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
      {$unwind: '$type'},
      {
        $lookup:{
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories'
        }
      },
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          variations: { $push: "$variations" }
        }
      },
      {
        $addFields: {
          "doc.variations": "$variations",
        }
      },
      {
        $replaceRoot: {
          newRoot: "$doc"
        }
      },
      {
        $match: { _id:  new mongoose.Types.ObjectId(_id) },
      },
    ];
    await this.regionModel.deleteMany({ r_id: _id }).exec();
    const results = await this.resultModel.aggregate<ResultDTO>(
      Minifiyrequest,
    );
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      for (let j = 0; j < result.variations.length; j++) {
        const variation = result.variations[j];
        new this.minResultModel({
          _id: new mongoose.Types.ObjectId(),
          vid: j,
          v_id: variation._id,
          rid: result.id,
          r_id: result._id,
          title: variation.title,
          shortDescription: variation.shortDescription,
          description: variation.description,
          actions: variation.actions,
          locations: variation.locations,
          filters: variation.filters,
          amountOfMoney: variation.amountOfMoney,
          timespan: variation.timespan,
          type: result.type,
          categories: result.categories,
          status: variation.status,
          updatedAt: result.updatedAt,
          createdAt: result.createdAt,
        }).save();
      }
    }
  }
  async create(result: CreateResultDTO, _id: string){
    const roles = {
      author: _id,
    };
    const history = [{
      by: _id,
      date: new Date(),
      eventType: HistoryEventType.created,
    }];
    
    const r = await new this.resultModel({
      _id: new mongoose.Types.ObjectId(),
      name: result.name,
      id: await this.counter.getNextSequenceValue('results'),
      categories: result.categories,
      variations: result.variations,
      roles,
      history,
      type: result.type,
    })
    r.save();
    this.minifyResult(r._id);
    return r;
  }

  async deleteResult(_id) {
    if (await this.resultModel.findById(_id)) {
      await this.minResultModel.deleteMany({r_id: _id})
      return await this.resultModel.findByIdAndDelete(_id)
    }
    throw new HttpException('Not found', HttpStatus.NOT_FOUND);
  }

  //TODO: check if Refs are used multiple times and if Refs exist
  async update(_id: string, changes: CreateResultDTO, userId: string) {
    const result = await this.resultModel.findById<ResultDTO>(_id);
    if(result) {
      result.history.push({
      by: userId,
      date: new Date().toISOString(),
      eventType: HistoryEventType.updated,
    })
      const response = await this.resultModel.findByIdAndUpdate({ _id }, {...changes, history: [...result.history]});
      await this.minResultModel.deleteMany({r_id: _id});
      this.minifyResult(_id);
      return response;
    }
    throw new HttpException('Result not found', HttpStatus.NOT_FOUND);
  }

  async updateMinResult(_id: string) {
    const result = await this.resultModel.findById<CreateResultDTO>(_id);
    if (!result) {
      throw new HttpException('Result not found', HttpStatus.NOT_FOUND);
    }
    try {
      await this.minResultModel.deleteMany({ r_id: _id });
      await this.minifyResult(_id);
      return { message: 'related Result has updated' };
    } catch (error) {
      throw new HttpException('min Results can not updated', HttpStatus.NOT_FOUND);
    }
  }

}
