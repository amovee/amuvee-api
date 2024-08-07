import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  MinResult,
  MinResultDocument,
  Result,
  ResultDocument,
} from 'src/shared/schemas/result.schema';
import mongoose, { PipelineStage } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Region, RegionDocument } from 'src/shared/schemas/region.schema';
import { Action, ActionDocument } from 'src/shared/schemas/action.schema';
import { QueryFilterDTO } from 'src/shared/dtos/query-filter.dto';
import {
  CreateResultDTO,
  MinResultDTO,
  ResultDTO,
} from 'src/shared/dtos/results.dto';
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
import { RegionDTO } from 'src/shared/dtos/region.dto';
import { isString } from 'class-validator';
import { Location, LocationDocument } from 'src/shared/schemas/location.schema';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
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
  async getMongoDBFilters(query: QueryFilterDTO, search?: string) {
    let regions: mongoose.Types.ObjectId[] = null;
    if (query.zip) {
      regions = (await this.getRegionsByZip(query.zip)).map(
        (region: Region) => new mongoose.Types.ObjectId(region._id.toString()),
      );
    }
    return mongoDBFiltersFromQueryFilter(query, regions, search);
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
      // {
      //   $lookup: {
      //     from: 'resulttypes',
      //     localField: 'type',
      //     foreignField: '_id',
      //     as: 'type',
      //   },
      // },
      // {
      //   $addFields: {
      //     type: { $arrayElemAt: ['$type', 0] },
      //   },
      // },

      {
        $lookup: {
          from: 'users',
          localField: 'roles.author',
          foreignField: '_id',
          as: 'roles.authorObjects',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'roles.reviewer',
          foreignField: '_id',
          as: 'roles.reviewerObjects',
        },
      },
      {
        $addFields: {
          'roles.author': {
            $arrayElemAt: [
              {
                $map: {
                  input: '$roles.authorObjects',
                  as: 'author',
                  in: { _id: '$$author._id', name: '$$author.name' },
                },
              },
              0,
            ],
          },
          'roles.reviewer': {
            $arrayElemAt: [
              {
                $map: {
                  input: '$roles.reviewerObjects',
                  as: 'reviewer',
                  in: { _id: '$$reviewer._id', name: '$$reviewer.name' },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $unset: ['roles.authorObjects', 'roles.reviewerObjects'],
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
    try{
    const list: ResultDTO[] = await this.resultModel
      .aggregate<ResultDTO>(request)
      .limit(1);
    if (list.length === 0) return;
    let regions: { [_id: string]: RegionDTO | null } = {};
    for (let i = 0; i < list[0].variations.length; i++) {
      const variation = list[0].variations[i];
      for (let j = 0; j < variation.filters.length; j++) {
        const filter = variation.filters[j];
        for (
          let k = 0;
          k < filter.regions.length;
          k++
        ) {
          const key = filter.regions[k];
          if (key instanceof mongoose.Types.ObjectId) {
            regions[key.toString()] = null;
          }
        }
      }
    }
    const r = await this.regionModel
      .find({ _id: { $in: Object.keys(regions) } })
      .exec();
    regions = r.reduce((acc, region) => {
      acc[region._id.toString()] = region;
      return acc;
    }, {});    
    for (let i = 0; i < list[0].variations.length; i++) {
      const variation = list[0].variations[i]
      for (let j = 0; j < variation.filters.length; j++) {
        const filter = variation.filters[j]
        for (
          let k = 0;
          k < filter.regions.length;
          k++
        ) {
          const key = filter.regions[k];
          if (key instanceof mongoose.Types.ObjectId) {
            list[0].variations[i].filters[j].regions[k] = regions[key._id.toString()];
          }
        }
        list[0].variations[i].filters[j].regions = list[0].variations[i].filters[j].regions.filter(a => a!= null);
      }
    }

    if (list.length === 0){
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }


    return list[0];
  }catch(error){
      console.error('Error fetching result by ID:', error);
      return undefined;
    }
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
    const results = await this.minResultModel.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$r_id',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $skip: skip },
      { $limit: limit },
    ]);
    return results.map((res: MinResultDTO) => {
      return res;
      // return filterResultLanguage(res, query.language);
    });
  }
  async getMinifiedResultsById(
      id: string,
      language: string,
    ): Promise<MinResultDTO> {
      return await this.minResultModel.findOne({ _id: id });
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

  async getMinifiedResultsByIds(
    rid: string,
    vid: string,
    language: string,
  ): Promise<MinResultDTO> {
    // Fetch the result using both rid and vid
    return await this.minResultModel.findOne({ rid, vid });
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
    search?: string,
  ): Promise<ResultDTO[]> {
    const filters = await this.getMongoDBFilters(query, search);
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
  async getCounter(query: QueryFilterDTO, search?: string): Promise<any> {
    const filters = await this.getMongoDBFilters(query, search);
    const total = await this.resultModel.aggregate([
      { $match: filters },
      {
        $count: 'totalCount',
      },
    ]);
    return total.length ? total[0] : { totalCount: 0 };
  }
  async getVariationsCounter(): Promise<any> {
    const total = await this.minResultModel.aggregate([
      { $match: {status: {$nin: ["ARCHIVED"]}} },
      {
        $count: 'totalCount',
      },
    ]);
    return total.length==1?total[0]:{totalCount: 0};
  }
  async getMinCounter(query: QueryFilterDTO): Promise<any> {
    const filters = await this.getMinMongoDBFilters(query);
    const total = await this.minResultModel.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$r_id',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
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
      { $unwind: '$variations' },
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
      { $unwind: '$type' },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories',
        },
      },
      {
        $group: {
          _id: '$_id',
          doc: { $first: '$$ROOT' },
          variations: { $push: '$variations' },
        },
      },
      {
        $addFields: {
          'doc.variations': '$variations',
        },
      },
      {
        $replaceRoot: {
          newRoot: '$doc',
        },
      },
    ];
    await this.minResultModel.deleteMany().exec();
    const results = await this.resultModel.aggregate<ResultDTO>(Minifiyrequest);
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      for (let j = 0; j < result.variations.length; j++) {
        const variation = result.variations[j];
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
      { $unwind: '$variations' },
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
      { $unwind: '$type' },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories',
        },
      },
      {
        $group: {
          _id: '$_id',
          doc: { $first: '$$ROOT' },
          variations: { $push: '$variations' },
        },
      },
      {
        $addFields: {
          'doc.variations': '$variations',
        },
      },
      {
        $replaceRoot: {
          newRoot: '$doc',
        },
      },
      {
        $match: { _id: new mongoose.Types.ObjectId(_id) },
      },
    ];
    await this.regionModel.deleteMany({ r_id: _id }).exec();
    const results = await this.resultModel.aggregate<ResultDTO>(Minifiyrequest);
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
  async create(result: CreateResultDTO, _id: string) {
    const roles = {
      author: _id,
    };
    const history = [
      {
        by: _id,
        date: new Date(),
        eventType: HistoryEventType.created,
      },
    ];

    const r = await new this.resultModel({
      _id: new mongoose.Types.ObjectId(),
      name: result.name,
      id: await this.counter.getNextSequenceValue('results'),
      categories: result.categories,
      variations: result.variations,
      roles,
      history,
      type: result.type,
    });
    await r.save();    
    this.minifyResult(r._id);
    return r;
  }

  async deleteResult(_id) {
    if (await this.resultModel.findById(_id)) {
      await this.minResultModel.deleteMany({ r_id: _id });
      return await this.resultModel.findByIdAndDelete(_id);
    }
    throw new HttpException('Not found', HttpStatus.NOT_FOUND);
  }

  //TODO: check if Refs are used multiple times and if Refs exist
  async update(_id: string, changes: CreateResultDTO, userId: string) {
    const result = await this.resultModel.findById<ResultDTO>(_id);
    if (!result)
      throw new HttpException('Result not found', HttpStatus.NOT_FOUND);
    result.history.push({
      by: userId,
      date: new Date().toISOString(),
      eventType: HistoryEventType.updated,
    });
    const response = await this.resultModel.findByIdAndUpdate(
      { _id },
      { ...changes, history: [...result.history] },
    );
    await this.minResultModel.deleteMany({ r_id: _id });
    this.minifyResult(_id);
    return response;
  }

  async updateMinResult(_id: any) {
    const result = await this.resultModel.findById<CreateResultDTO>(_id);
    if (!result) {
      throw new HttpException('Result not found', HttpStatus.NOT_FOUND);
    }
    try {
      await this.minResultModel.deleteMany({ r_id: _id });
      await this.minifyResult(_id);
      return { message: 'related Result has updated' };
    } catch (error) {
      throw new HttpException(
        'min Results can not updated',
        HttpStatus.NOT_FOUND,
      );
    }
  }
  async findResultsByRegionId(regionId: number) {
    const region = await this.regionModel.findOne({ id: regionId }).exec();
    if (!region) {
      throw new NotFoundException(`Region with id ${regionId} not found`);
    }
    const regionObjectId = region._id;
    return await this.resultModel.find({
      "variations.filters.regions": {
        $elemMatch: {
          $eq: regionObjectId
        }
      }
    })
    .select('_id id name')
    .lean()
    .exec();
  }
  async findResultsByActionId(actionId: number) {
    const action = await this.actionModel.findOne({ id: actionId }).exec();
    if (!action) {
      throw new NotFoundException(`Action with id ${actionId} not found`);
    }

    const actionObjectId = action._id;
    return await this.resultModel.find({
      "variations.actions": {
        $elemMatch: {
          $eq: actionObjectId
        }
      }
    })
    .select('_id id name')
    .lean()
    .exec();
  }
  async findResultsByLocationId(locationId: number) {
    const location = await this.locationModel.findOne({ id: locationId }).exec();
    if (!location) {
      throw new NotFoundException(`location with id ${locationId} not found`);
    }

    const locationObjectId = location._id;
    return await this.resultModel.find({
      "variations.locations": {
        $elemMatch: {
          $eq: locationObjectId
        }
      }
    })
    .select('_id id name')
    .lean()
    .exec();
  }
  async findUnreferencedActions() {
    try {
      const referencedActions = await this.resultModel.aggregate([
        { $unwind: "$variations" },
        { $unwind: "$variations.actions" },
        { $group: { _id: "$variations.actions" } }
      ]).exec();      
      const referencedActionIds = referencedActions.map(action => action._id);      
        const unreferencedActions = await this.actionModel.aggregate([
        { 
          $match: { 
            _id: { 
              $nin: referencedActionIds.map(id => {
                try {
                  return new ObjectId(id); 
                } catch (e) {
                  console.error(`Invalid ObjectId: ${id}`);
                  return null;
                }
              }).filter(id => id !== null) 
            } 
          } 
        },
        { $project: { name: 1, id: 1, _id: 1 } }
      ]).exec();
  
      return unreferencedActions;
  
    } catch (error) {
      console.error("An error occurred while finding unreferenced actions:", error);
      throw error;
    }
  }
  async findUnreferencedLocations() {
    try {
      // 1. Hole alle referenzierten Locations
      const referencedLocations = await this.resultModel.aggregate([
        { $unwind: "$variations" },
        { $unwind: "$variations.locations" },
        { $group: { _id: "$variations.locations" } }
      ]).exec();
  
      // 2. Erstelle eine Liste der referenzierten Location IDs
      const referencedLocationIds = referencedLocations.map(location => location._id);
  
      // 3. Hole alle Locations, die nicht referenziert werden
      const unreferencedLocations = await this.locationModel.aggregate([
        { 
          $match: { 
            _id: { 
              $nin: referencedLocationIds.map(id => {
                try {
                  return new ObjectId(id); 
                } catch (e) {
                  console.error(`Invalid ObjectId: ${id}`);
                  return null;
                }
              }).filter(id => id !== null) // Filtere ungültige ObjectId-Instanzen heraus
            } 
          } 
        },
        { $project: { name: 1, id: 1, _id: 1 } }
      ]).exec();
  
      return unreferencedLocations;
  
    } catch (error) {
      console.error("An error occurred while finding unreferenced locations:", error);
      throw error;
    }
  }
  async findUnreferencedRegions() {
    try {
      // 1. Hole alle referenzierten Regionen
      const referencedRegions = await this.resultModel.aggregate([
        { $unwind: "$variations" },
        { $unwind: "$variations.regions" },
        { $group: { _id: "$variations.regions" } }
      ]).exec();
  
      // 2. Erstelle eine Liste der referenzierten Region IDs
      const referencedRegionIds = referencedRegions.map(region => region._id);
  
      // 3. Hole alle Regionen, die nicht referenziert werden
      const unreferencedRegions = await this.regionModel.aggregate([
        { 
          $match: { 
            _id: { 
              $nin: referencedRegionIds.map(id => {
                try {
                  return new ObjectId(id); 
                } catch (e) {
                  console.error(`Invalid ObjectId: ${id}`);
                  return null;
                }
              }).filter(id => id !== null) // Filtere ungültige ObjectId-Instanzen heraus
            } 
          } 
        },
        { $project: { name: 1, id: 1, _id: 1 } }
      ]).exec();
  
      return unreferencedRegions;
  
    } catch (error) {
      console.error("An error occurred while finding unreferenced regions:", error);
      throw error;
    }
  }
}
