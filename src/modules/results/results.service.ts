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

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    @InjectModel(Filter.name) private filterModel: Model<FilterDocument>,
  ) {}

  minFilter(key: string, value: number) {
    const f0 = {};
    f0[key + '.min'] = { $lte: value };
    const f1 = {};
    f1[key + '.min'] = { $eq: null };
    return {
      $or: [f0, f1],
    };
  }
  maxFilter(key: string, value: number) {
    const f0 = {};
    f0[key + '.max'] = { $gte: value };
    const f1 = {};
    f1[key + '.max'] = { $eq: null };
    return {
      $or: [f0, f1],
    };
  }
  async getResultFilterById(resultId: string): Promise<any[]> {
    const result = await this.resultModel.findOne({_id: resultId});
    return await this.filterModel.find({
      _id: { $in: result.filters }
    })
  }
  async getCurrentFilters(query: QueryFilterDTO) {
    const regions: any[] = await this.regionModel
      .find({
        zips: { $elemMatch: { $eq: `${query.zip}` } },
      })
      .select('_id');
      
      for (let i = 0; i < regions.length; i++) {
        regions[i] = regions[i]._id;
      }

    const outerfilters = [];
    if (query.category) {
      outerfilters.push({
        $or: [
          {
            categories: new mongoose.Types.ObjectId(query.category),
          },
          {
            categories: { $size: 0 },
          },
        ],
      });
    }
    if (query.status) {
      outerfilters.push({ status: { $eq: query.status } });
    }
    const innerfilters = [];
    if (query.rent != null && ++query.rent >= 0) {
      innerfilters.push(this.minFilter('rent', +query.rent));
      innerfilters.push(this.maxFilter('rent', +query.rent));
    } else {
      innerfilters.push({ 'rent.min': { $eq: null } });
      innerfilters.push({ 'rent.max': { $eq: null } });
    }
    if (query.income != null && query.income >= 0) {
      innerfilters.push(this.minFilter('income', +query.income));
      innerfilters.push(this.maxFilter('income', +query.income));
    } else {
      innerfilters.push({ 'income.min': { $eq: null } });
      innerfilters.push({ 'income.max': { $eq: null } });
    }
    if (query.childrenCount != null && +query.childrenCount > 0) {
      innerfilters.push(this.minFilter('childrenCount', +query.childrenCount));
      innerfilters.push(this.maxFilter('childrenCount', +query.childrenCount));
      if (query.childrenAgeGroups && query.childrenAgeGroups.length > 0) {
        innerfilters.push(
          this.minFilter(
            'childrenAge',
            Math.max(...(<number[]>query.childrenAgeGroups)),
          ),
        );
        innerfilters.push(
          this.maxFilter(
            'childrenAge',
            Math.min(...(<number[]>query.childrenAgeGroups)),
          ),
        );
      } else {
        innerfilters.push({ 'childrenAge.min': { $eq: null } });
        innerfilters.push({ 'childrenAge.max': { $eq: null } });
      }
    } else {
      innerfilters.push({ 'childrenCount.min': { $eq: null } });
      innerfilters.push({ 'childrenCount.max': { $eq: null } });
    }
    if (query.parentAge && +query.parentAge >= 0) {
      innerfilters.push(this.minFilter('parentAge', +query.parentAge));
      innerfilters.push(this.maxFilter('parentAge', +query.parentAge));
    }
    if (query.zip) {
      innerfilters.push({
        $or: [
          { $and: [{ zips: { $size: 0 } }, { regions: { $size: 0 } }] },
          { zips: { $in: [`${query.zip}`] } },
          { regions: { $in: regions } },
        ],
      });
    } else {
      console.log('TODO');
    }
    if (query.parentGender) {
      innerfilters.push({
        $or: [
          { parentGender: { $size: 0 } },
          { parentGender: { $in: [`${query.parentGender}`] } },
        ],
      });
    } else {
      innerfilters.push({ parentGender: { $size: 0 } });
    }
    if (query.insurance) {
      innerfilters.push({
        $or: [
          { insurances: { $size: 0 } },
          { insurances: { $in: [query.insurance] } },
        ],
      });
    }
    if (query.jobRelatedSituation != undefined) {
      innerfilters.push({
        $or: [
          { jobRelatedSituations: { $size: 0 } },
          {
            jobRelatedSituations: {
              $in: [query.jobRelatedSituation],
            },
          },
        ],
      });
    }

    //DONE
    if (query.relationship != undefined) {
      innerfilters.push({
        $or: [
          { relationships: { $size: 0 } },
          { relationships: { $in: [query.relationship] } },
        ],
      });
    }

    //DONE
    innerfilters.push({
      requiredKeys: {
        $not: {
          $elemMatch: {
            $nin: query.keys ? query.keys : [],
          },
        },
      },
    });

    // innerfilters.push({ $or: [{"keywords.restricted": {$nin: query.keys}}, {"keywords.restricted": {$size: 0}}] });
    return {
      $and: [
        ...outerfilters,
        {
          filters: {
            $elemMatch: { $and: innerfilters },
          },
        },
      ],
    };
  }
  private lookUp(collection: string) {
    return {
      $lookup: {
        from: collection,
        localField: collection,
        foreignField: '_id',
        as: collection,
      },
    };
  }
  async getResultFromId(
    id: string,
    language: string
  ): Promise<getFormattedResultDTO> {
    if (!language) language = 'de';
    const result: Result =
      await this.regionModel.findOne({oldId: id}).populate('filters').populate('actions').populate('locations')
      if (language) {
        if (result.content.hasOwnProperty(language)) {
          result.content = { [language]: result.content[language] };
        } else if (result.content.hasOwnProperty('de'))
          result.content = { de: result.content.de };
        else result.content = {};
      }      
      const formattedResult: getFormattedResultDTO = {
        id: result._id.toString(),
        oldId: +result.oldId,
        content: result.content,
        locations: result.locations,
        amountOfMoney: result.amountOfMoney,
        categories: result.categories.map(c=>c._id.toString()),
        period: { start: null, end: null },
        actions: [],
        type: this.getType(result.type, language),
      };
      
      result.actions.forEach((action) => {
        const tmpAction: getFormattedActionDTO = {
          id: action._id.toString(),
          content: {}
        }
        if (language) {
          if (action.content.hasOwnProperty(language)) {
            tmpAction.content[language] = action.content[language];
          } else if(action.content.hasOwnProperty('de')) {
            tmpAction.content[language] = action.content['de'];
          }
        }
        formattedResult.actions.push(tmpAction);
      });
    return formattedResult;
  }
  async getAllFromCategory(
    id: string,
    language: string
  ): Promise<getFormattedResultDTO[]> {
    if (!language) language = 'de';
    const results: getFormattedResultDTO[] = (
      await this.resultModel
        .aggregate([
          this.lookUp('filters'),
          {
            $match: {
              categories: { $in: [new mongoose.Types.ObjectId(id)]}
            },
          },
          this.lookUp('actions'),
          this.lookUp('locations'),
        ])
    ).map((tmp) => {
      if (language) {
        if (tmp.content.hasOwnProperty(language)) {
          tmp.content = { [language]: tmp.content[language] };
        } else if (tmp.content.hasOwnProperty('de'))
          tmp.content = { de: tmp.content.de };
        else tmp.content = {};
      }      
      const result: getFormattedResultDTO = {
        id: tmp._id.toString(),
        oldId: +tmp.oldId,
        content: tmp.content,
        locations: tmp.locations,
        amountOfMoney: tmp.amountOfMoney,
        categories: tmp.categories,
        period: { start: null, end: null },
        actions: [],
        type: this.getType(tmp.type, language),
      };
      
      tmp.actions.forEach((action) => {
        const tmpAction: getFormattedActionDTO = {
          id: action._id.toString(),
          content: {}
        }
        if (language) {
          if (action.content.hasOwnProperty(language)) {
            tmpAction.content[language] = action.content[language];
          } else if(action.content.hasOwnProperty('de')) {
            tmpAction.content[language] = action.content['de'];
          }
        }
        result.actions.push(tmpAction);
      });
      return result;
    });
    return results;
  }
  async getAll(
    limit: number,
    skip: number,
    query: QueryFilterDTO,
  ): Promise<getFormattedResultDTO[]> {
    if (!query.language) query.language = 'de';
    const filters = await this.getCurrentFilters(query);
      
    const results: getFormattedResultDTO[] = (
      await this.resultModel
        .aggregate([
          this.lookUp('filters'),
          {
            $match: filters,
          },
          this.lookUp('actions'),
          this.lookUp('locations'),
        ])
        .skip(skip)
        .limit(limit)
    ).map((tmp) => {
      if (query.language) {
        if (tmp.content.hasOwnProperty(query.language)) {
          tmp.content = { [query.language]: tmp.content[query.language] };
        } else if (tmp.content.hasOwnProperty('de'))
          tmp.content = { de: tmp.content.de };
        else tmp.content = {};
      }      
      const result: getFormattedResultDTO = {
        id: tmp._id.toString(),
        oldId: +tmp.oldId,
        content: tmp.content,
        locations: tmp.locations,
        amountOfMoney: tmp.amountOfMoney,
        categories: tmp.categories,
        period: { start: null, end: null },
        actions: [],
        type: this.getType(tmp.type, query.language),
      };
      
      tmp.actions.forEach((action) => {
        const tmpAction: getFormattedActionDTO = {
          id: action._id.toString(),
          content: {}
        }
        if (query.language) {
          if (action.content.hasOwnProperty(query.language)) {
            tmpAction.content[query.language] = action.content[query.language];
          } else if(action.content.hasOwnProperty('de')) {
            tmpAction.content[query.language] = action.content['de'];
          }
        }
        result.actions.push(tmpAction);
      });
      return result;
    });
    return results;
  }
  getType(
    type: number,
    language: string,
  ): { name: { [language: string]: string }; weight: number } {
    const types = [
      {
        id: 2,
        name: {
          de: 'einmaliger Zuschuss',
          uk: 'одноразова субсидія/виплата/безповоротна позичка',
          ru: 'однократная субсидия/выплата/безвозвратная ссуда',
        },
        weight: 800,
      },
      {
        id: 3,
        name: {
          de: 'Beratung',
          uk: 'консультація/консультування',
          ru: 'консультация/консультирование',
        },
        weight: 600,
      },
      {
        id: 4,
        name: {
          de: 'Sachleistung',
          uk: 'негрошові форми соціальної допомоги',
          ru: 'неденежные формы социальной помощи',
        },
        weight: 700,
      },
      {
        id: 6,
        name: {
          de: 'monatliche Geldzahlung',
          uk: 'щомісячна грошова оплата',
          ru: 'ежемесячная выплата денег',
        },
        weight: 900,
      },
      {
        id: 9,
        name: {
          de: 'Ermäßigung/ Rabatt',
          uk: 'зниження плати/знижка',
          ru: 'снижение платы /скидка',
        },
        weight: 300,
      },
      {
        id: 10,
        name: {
          de: 'Dienstleistung',
          uk: 'надання послуг/виконання послуги/обслуговування',
          ru: 'оказание услуг/исполнение услуги/обслуживание',
        },
        weight: 650,
      },
    ];
    const tmpType = { weight: types[type].weight, name: {} };
    tmpType.name[language] = types[type].name[language];
    return tmpType;
  }

  // async getFilteredActions(
  //   resultId: string,
  //   isMin = false
  // ): Promise<any> {
  //   const actionIds = (await this.resultModel
  //     .findOne({_id: resultId}).exec()).actions;
  //   return await this.actionModel
  //   .find({
  //     '_id': {
  //       $in: actionIds,
  //     },
  //   }, isMin? this.MIN_ACTION_PROJECTION: {}).exec();
  // }
  async getFilteredResultCount(query: QueryFilterDTO): Promise<number> {
    return await this.resultModel.count(await this.getCurrentFilters(query)).exec();
  }
}
