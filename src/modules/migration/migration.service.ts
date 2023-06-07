import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Model, ObjectId } from 'mongoose';
import { Category, CategoryDocument } from 'src/shared/schemas/category.schema';
import { Variation, Result, ResultDocument, ResultType, ResultTypeDocument } from 'src/shared/schemas/result.schema';
import { LocationDocument, Location } from 'src/shared/schemas/location.schema';
import { Region, RegionDocument } from 'src/shared/schemas/region.schema';
import { Action, ActionDocument } from 'src/shared/schemas/action.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { Insurance, InsuranceDocument } from 'src/shared/schemas/insurance.schema';
import mongoose from 'mongoose';
import { CounterService } from '../counters/counters.service';
import { mappingStateType } from 'src/types/types.dto';
import { migrateRoles } from 'src/types/roles.dto';
import getType, { result_types } from '../results/result.migration';

@Injectable()
export class MigrationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(ResultType.name) private resultTypeModel: Model<ResultTypeDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    @InjectModel(Insurance.name)
    private insuranceModel: Model<InsuranceDocument>,
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
    private readonly counter: CounterService,
  ) {}

  async migrateResulttypes() {
    await this.resultTypeModel.deleteMany().exec();
    result_types.forEach((resultType)=>{
      new this.resultTypeModel({
        _id: new mongoose.Types.ObjectId(),
        name: resultType.name,
        weight: resultType.weight
      }).save();
    })
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
  transformKeyWords(result): string[] {
    const requiredKeys = [];
    if (result.is_pregnant) {
      requiredKeys.push('pregnant');
    }
    if (result.victim_of_violence) {
      requiredKeys.push('victimsOfViolence');
    }
    return requiredKeys;
  }
  async migrateResultsFromAllCategories(): Promise<void> {
    await this.resultModel.deleteMany().exec();
    const categories = await this.categoryModel.find().exec();
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      await this.migrateResults(category);
    }
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
    if(result.zip) {
      const zips = result.zip.replaceAll(' ', '').replaceAll('\n', '').replaceAll(',,', ',')
      const region: Region = await this.regionModel.findOne({zips}).exec();
      return region? [region._id]: [];
    } else if(result.region) {
      const region: Region = await this.regionModel.findOne({id: result.region}).exec();
      return region? [region._id]: [];
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
  async createFilter(
    result: any,
    insurances: any,
    locationIds: any,
  ) {
    const relationships = result.has_relationship.map(
      (i) => i.relationship_types_id,
    );
    const jobRelatedSituations = result.has_job_related_situation.map(
      (i) => i.job_related_situations_id,
    );
    const parentGender = result.parent_gender ? [result.parent_gender] : [];
    return {
      name: 'Variation 1',
      timespan: { from: result.start_date, to: result.end_date },
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
      requiredKeys: this.transformKeyWords(result),
      insurances,
      relationships,
      jobRelatedSituations,

      amountOfMoney: this.generateMinMaxFilter(
        result.min_amount_of_money,
        result.max_amount_of_money,
      ),
      content: this.getContent(result),
      actions: await this.getActionList(result),
      locations: locationIds[result.location]
      ? [locationIds[result.location]]
      : [],
      variables: [],
    };
  }
  getContent(result: any) {
    const content = {
      de: {
        title: result.name,
        description: result.description,
        shortDescription: result.short_description,
      },
    };
    if (!!result.russian) {
      content['ru'] = {
        title: result.russian.name,
        description: result.russian.description,
        shortDescription: result.russian.short_description,
      };
    }
    if (!!result.ukrainian) {
      content['uk'] = {
        title: result.ukrainian.name,
        description: result.ukrainian.description,
        shortDescription: result.ukrainian.short_description,
      };
    }
    return content;
  }
  async migrateResults(category: Category): Promise<any> {
    const locationIds: any = await this.getlocationIDs();
    const insuranceIds: any = await this.getInsuranceIds();
    const users: User[] = await this.userModel.find().exec();
    const resultTypes: ResultType[] = await this.resultTypeModel.find().exec();
    const resultTypeMap = {}
    resultTypes.forEach(type => {
      resultTypeMap[type.weight] = type._id;
    });
    // console.log(resultTypes.filter((rt)=>rt.weight == 700));

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
        `${process.env.DIRECTUS_URL}items/result?fields=${fields}&sort=id&limit=${counter}&filter={"category":{"_eq":${category.id}}}`,
      )
    ).data.data;

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const filter = await this.createFilter(
        result,
        result.has_insurance.map((i) => insuranceIds[i.insurance_id]),
        locationIds,
      );      
      new this.resultModel({
        _id: new mongoose.Types.ObjectId(),
        name: result.name.replaceAll('&shy;', ''),
        id: await this.counter.setMaxSequenceValue('results', +result.id),
        specific: result.specific,
        categories: [category._id],
        variations: [filter],
        status: mappingStateType(result.status),
        sort: result.sort,
        roles: migrateRoles(result, users),
        type: resultTypeMap[result.type.weight],
      }).save();
    }
    return results;
  }
}
