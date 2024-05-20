import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Model, ObjectId } from 'mongoose';
import { Category, CategoryDocument } from 'src/shared/schemas/category.schema';
import {
  Variation,
  Result,
  ResultDocument,
  ResultType,
  ResultTypeDocument,
} from 'src/shared/schemas/result.schema';
import { LocationDocument, Location } from 'src/shared/schemas/location.schema';
import { Region, RegionDocument } from 'src/shared/schemas/region.schema';
import { Action, ActionDocument } from 'src/shared/schemas/action.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import {
  Insurance,
  InsuranceDocument,
} from 'src/shared/schemas/insurance.schema';
import mongoose from 'mongoose';
import { CounterService } from '../counters/counters.service';
import { result_types } from '../results/result.migration';
import { State, mappingStateType } from 'src/shared/dtos/types.dto';
import { HistoryEventType } from 'src/shared/dtos/roles.dto';
import { ResultsService } from '../results/results.service';

@Injectable()
export class MigrationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(ResultType.name)
    private resultTypeModel: Model<ResultTypeDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    @InjectModel(Insurance.name)
    private insuranceModel: Model<InsuranceDocument>,
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
    private readonly counter: CounterService,
    private readonly resultService: ResultsService,
  ) {}

  async migrateResulttypes() {
    await this.resultTypeModel.deleteMany().exec();
    for (let i = 0; i < result_types.length; i++) {
      const resultType = result_types[i];
      const counter = await this.counter.setMaxSequenceValue(
        'resultTypes',
        +resultType.id,
      );
      new this.resultTypeModel({
        _id: new mongoose.Types.ObjectId(),
        id: counter,
        name: resultType.name,
        weight: resultType.weight,
      }).save();
    }
  }

  transformPostalCodes(result: any): string[] {
    let postalcodes = [];
    if (result.zip) {
      postalcodes = result.zip.replace(' ', '');
    } else if (result.postalcodes) {
      postalcodes = result.postalcodes.replace(' ', '');
    }
    return postalcodes;
  }
  async migrateResultsFromAllCategories(): Promise<void> {
    await this.resultModel.deleteMany().exec();
    const blocks = (
      await axios.get(
        `${process.env.DIRECTUS_URL}items/building_block?fields=id,name,result`,
      )
    ).data.data;
    const categories = await this.categoryModel.find().exec();
    const locationIds: any = await this.getlocationIDs();
    const insuranceIds: any = await this.getInsuranceIds();
    const users: User[] = await this.userModel.find().exec();
    const resultTypes: ResultType[] = await this.resultTypeModel.find().exec();
    const resultTypeMap = {};
    resultTypes.forEach((type) => {
      resultTypeMap[type.weight] = type._id;
    });

    const excluded_resultids = [];
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      block.result.forEach((id) => {
        excluded_resultids.push(+id);
      });
      await this.migrateBuildingBlock(
        block,
        categories,
        locationIds,
        insuranceIds,
        users,
        resultTypeMap,
      );
    }
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      await this.migrateResults(
        category,
        excluded_resultids,
        locationIds,
        insuranceIds,
        users,
        resultTypeMap,
      );
    }
    this.resultService.minifyAllResults();
  }
  generateMinMaxFilter(
    min: number,
    max: number,
  ): { min: number | null; max: number | null } {
    return {
      min: min == undefined ? null : min,
      max: max == undefined ? null : max,
    };
  }

  async getlocationIDs() {
    const locationIds: any = {};
    const locations = await this.locationModel.find().exec();
    locations.forEach((location) => {
      locationIds[location.id] = location._id;
    });
    return locationIds;
  }
  async getRegion(result): Promise<ObjectId[]> {
    if (result.zip) {
      const zips = result.zip
        .replaceAll(' ', '')
        .replaceAll('\n', '')
        .replaceAll(',,', ',');
      const region: Region = await this.regionModel.findOne({ zips }).exec();
      return region ? [region._id] : [];
    } else if (result.region) {
      const region: Region = await this.regionModel
        .findOne({ id: result.region })
        .exec();
      return region ? [region._id] : [];
    }
    return [];
  }
  async getInsuranceIds() {
    const insuranceIds: any = {};
    const insurances = await this.insuranceModel.find().exec();
    insurances.forEach((insurance) => {
      insuranceIds[insurance.id] = insurance._id;
    });
    return insuranceIds;
  }
  async getNumberOfAllResults() {
    return (
      await axios.get(
        `${process.env.DIRECTUS_URL}items/result?fields=*&limit=0&meta=filter_count`,
      )
    ).data.meta.filter_count;
  }
  async getActionList(result: any) {
    const actions = [];
    for (let i = 0; i < result.actions.length; i++) {
      const action = await this.actionModel
        .findOne({ id: result.actions[i].action_id }, ['results'])
        .exec();
      if (action) {
        actions.push(action._id);
      }
    }
    return actions;
  }
  async createVariation(
    result: any,
    insurances: any,
    locationIds: any,
    createdAt: Date,
    updatedAt: Date,
    index = 0,
  ) {
    const relationships = result.has_relationship.map(
      (i) => i.relationship_types_id,
    );
    const jobRelatedSituations = result.has_job_related_situation.map(
      (i) => i.job_related_situations_id,
    );
    const parentGender = result.parent_gender ? [result.parent_gender] : [];
    const variation = {
      name: !!result.specific
        ? result.specific
        : index == 0
          ? 'Hauptvariation'
          : 'Variation' + index,
      status: mappingStateType(result.status),
      createdAt: createdAt,
      updatedAt: updatedAt,
      timespan: { from: result.start_date, to: result.end_date },
      filters: {
        rent: this.generateMinMaxFilter(result.min_rent, result.max_rent),
        income: this.generateMinMaxFilter(result.min_income, result.max_income),
        childrenCount: this.generateMinMaxFilter(
          result.min_children_count,
          result.max_children_count,
        ),
        childrenAge: this.generateMinMaxFilter(result.min_age, result.max_age),
        parentAge: this.generateMinMaxFilter(
          result.min_mother_age,
          result.max_mother_age,
        ),
        parentGender,
        regions: await this.getRegion(result),
        isPregnant: result.is_pregnant,
        isVictimOfViolence: result.victim_of_violence,
        isRefugee: result.hide_german,
        insurances,
        relationships,
        jobRelatedSituations,
      },
      amountOfMoney: this.generateMinMaxFilter(
        result.min_amount_of_money,
        result.max_amount_of_money,
      ),
      title: { de: result.name },
      description: { de: result.description },
      shortDescription: { de: result.short_description },
      actions: await this.getActionList(result),
      locations: locationIds[result.location]
        ? [locationIds[result.location]]
        : [],
      variables: [],
    };
    if (!!result.russian) {
      variation.title['ru'] = result.russian.name;
      variation.description['ru'] = result.russian.description;
      variation.shortDescription['ru'] = result.russian.short_description;
    }
    if (!!result.ukrainian) {
      variation.title['uk'] = result.ukrainian.name;
      variation.description['uk'] = result.ukrainian.description;
      variation.shortDescription['uk'] = result.ukrainian.short_description;
    }
    return variation;
  }
  async migrateBuildingBlock(
    block: {
      id: number;
      name: string;
      result: number[];
    },
    categories: Category[],

    locationIds: any,
    insuranceIds: any,
    users: User[],
    resultTypeMap: any,
  ) {
    const fields = [
      '*',
      'has_insurance.*',
      'has_relationship.*',
      'has_job_related_situation.*',
      'relationship_types.*',
      'type.*',
      'russian.*',
      'ukrainian.*',
      'actions.*',
    ].join(',');
    const counter = await this.getNumberOfAllResults();
    const results = (
      await axios.get(
        `${process.env.DIRECTUS_URL}items/result?fields=${fields}&sort=id&limit=${counter}&filter={"id":{"_in": [${block.result}]}}`,
      )
    ).data.data;
    const admin = await this.userModel.findOne({ name: 'admin' }).exec();
    let minId = Infinity;
    const category_ids = [];
    const variations = [];
    for (let j = 0; j < results.length; j++) {
      if (+results[j].id < minId) minId = +results[j].id;
      const cid = categories.find((c) => c.id === +results[j].category)._id;
      if (!!cid && !category_ids.includes(cid)) {
        category_ids.push(cid);
      }
      variations.push(
        await this.createVariation(
          results[j],
          results[j].has_insurance.map((i) => insuranceIds[i.insurance_id]),
          locationIds,
          new Date(results[j].date_created),
          new Date(results[j].date_updated),
          j,
        ),
      );
    }
    new this.resultModel({
      _id: new mongoose.Types.ObjectId(),
      name: block.name,
      status: State.published,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: await this.counter.setMaxSequenceValue('results', +minId),
      categories: category_ids,
      variations,
      roles: { author: admin },
      history: [
        {
          by: admin._id,
          date: new Date(),
          eventType: HistoryEventType.created,
          value: 'Created on migration',
        },
      ],
      type: resultTypeMap[results[0].type.weight],
    }).save();
  }
  async migrateResults(
    category: Category,
    excluded_results: number[],
    locationIds: any,
    insuranceIds: any,
    users: User[],
    resultTypeMap: any,
  ): Promise<any> {
    const fields = [
      '*',
      'has_insurance.*',
      'has_relationship.*',
      'has_job_related_situation.*',
      'relationship_types.*',
      'type.*',
      'russian.*',
      'ukrainian.*',
      'actions.*',
    ].join(',');

    const counter = await this.getNumberOfAllResults();
    const results = (
      await axios.get(
        `${process.env.DIRECTUS_URL}items/result?fields=${fields}&sort=id&limit=${counter}&filter={"_and":[{"id":{"_nin": [${excluded_results}]}},{"category":{"_eq":${category.id}}}]}`,
      )
    ).data.data;
    console.log('DONE');
    const admin = await this.userModel.findOne({ name: 'admin' }).exec();
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const roles = {
        author: undefined,
        reviewer: undefined,
      };
      const history = [];
      if (result.user_created) {
        let userCreated = await this.userModel
          .findOne({ oldId: result.user_created })
          .exec();
        if (!userCreated) {
          userCreated = admin;
        }
        roles.author = userCreated._id;
        history.push({
          by: userCreated._id,
          date: result.date_created,
          eventType: HistoryEventType.created,
        });
      }
      if (result.user_updated) {
        const userUpdated = await this.userModel
          .findOne({ oldId: result.user_updated })
          .exec();
        if (userUpdated) {
          roles.author = userUpdated._id;
          history.push({
            by: userUpdated._id,
            date: result.date_updated,
            eventType: HistoryEventType.updated,
            value: 'Last update by Directus UI',
          });
        }
      }
      history.push({
        by: admin._id,
        date: new Date().toISOString(),
        eventType: HistoryEventType.migrated,
        value: 'Migrated from Directus',
      });
      const variation = await this.createVariation(
        result,
        result.has_insurance.map((i) => insuranceIds[i.insurance_id]),
        locationIds,
        history[0].date,
        history[history.length - 1].date,
        0,
      );
      new this.resultModel({
        _id: new mongoose.Types.ObjectId(),
        name: result.name.replaceAll('&shy;', ''),
        status: mappingStateType(result.status),
        createdAt: history[0].date,
        updatedAt: history[history.length - 1].date,
        id: await this.counter.setMaxSequenceValue('results', +result.id),
        categories: [category._id],
        variations: [{ ...variation, roles, history }],
        roles,
        history,
        sort: result.sort,
        type: resultTypeMap[result.type.weight],
      }).save();
    }
    return results;
  }
}
