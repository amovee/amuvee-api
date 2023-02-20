import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../categories/category.schema';
import {
  Filter,
  FilterDocument,
  Result,
  ResultDocument,
} from '../results/result.schema';
import { LocationDocument, Location } from '../locations/location.schema';
import { Region, RegionDocument } from '../../schemas/region.schema';
import { Action, ActionDocument } from '../actions/action.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Insurance, InsuranceDocument } from '../insurances/insurance.schema';
import mongoose from 'mongoose';

@Injectable()
export class MigrationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Filter.name) private filterModel: Model<FilterDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    @InjectModel(Insurance.name)
    private insuranceModel: Model<InsuranceDocument>,
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
  ) {}

  // generatePassword(len: number): string {
  //   const charset =
  //     'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  //   let retVal = '';
  //   for (let i = 0, n = charset.length; i < len; ++i) {
  //     retVal += charset.charAt(Math.floor(Math.random() * n));
  //   }
  //   return retVal;
  // }
  // async migrateUsers(): Promise<any> {
  //   let users = (await axios.get(process.env.DIRECTUS_URL + 'users')).data.data;
  //   if (users) {
  //     users = users.map((user) => ({
  //       username: user.last_name + '' + user.first_name,
  //       password: this.generatePassword(15),
  //       role: 'admin',
  //       oldId: user.id,
  //       email: user.email,
  //     }));
  //     for (let i = 0; i < users.length; i++) {
  //       await this.migrateUser(users[i]);
  //     }
  //   }
  //   return users.map((user) => ({
  //     username: user.username,
  //     password: user.password,
  //   }));
  // }
  // async migrateUser(toCreate: IUser): Promise<User> {
  //   const user = await this.userModel
  //     .findOne({ username: toCreate.username })
  //     .exec();
  //   if (user == null) {
  //     if (!toCreate || !toCreate.username || !toCreate.password) {
  //       throw new HttpException(
  //         {
  //           status: HttpStatus.FORBIDDEN,
  //           error: 'User not Complete',
  //         },
  //         HttpStatus.FORBIDDEN,
  //       );
  //     }
  //     return new this.userModel({
  //       username: toCreate.username,
  //       password: toCreate.password,
  //       role: toCreate.role,
  //       oldId: toCreate.oldId,
  //       email: toCreate.email,
  //     }).save();
  //   } else {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.FORBIDDEN,
  //         error: 'user already exists',
  //       },
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  // }

  transformPostalCodes(result: any): string[] {
    let postalcodes = [];
    if (result.zip) {
      postalcodes = result.zip.replace(' ', '').split(',');
    } else if (result.postalcodes) {
      postalcodes = result.postalcodes.replace(' ', '').split(',');
    }
    return postalcodes;
  }
  transformKeyWords(result): string[] {
    const requiredKeys = [];
    if (result.is_pregnant) {
      requiredKeys.push('pregnant');
    }
    if (result.victim_of_violence) {
      requiredKeys.push('victim_of_violence');
    }
    return requiredKeys;
  }
  async migrateResultsFromAllCategories(): Promise<void> {
    await this.resultModel.deleteMany().exec();
    await this.filterModel.deleteMany().exec();
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

  async migrateResults(category: Category): Promise<any> {
    const locationIds: any = {};
    const locations = await this.locationModel.find().exec();
    const users: User[] = await this.userModel.find().exec();
    locations.forEach((location) => {
      locationIds[location.oldId] = location._id;
    });
    const regionIds: any = {};
    const regions = await this.regionModel.find().exec();
    regions.forEach((region) => {
      regionIds[region.id] = region._id;
    });
    const insuranceIds: any = {};
    const insurances = await this.insuranceModel.find().exec();
    insurances.forEach((insurance) => {
      insuranceIds[insurance.oldId] = insurance._id;
    });
    const fields =
      '*,has_insurance.*,has_relationship.*,has_job_related_situation.*,relationship_types.*,type.*,russian.*,ukrainian.*,actions.*';

    const counter = (
      await axios.get(
        process.env.DIRECTUS_URL +
          'items/result?fields=*&limit=0&meta=filter_count',
      )
    ).data.meta.filter_count;
    const results = (
      await axios.get(
        process.env.DIRECTUS_URL +
          'items/' +
          'result?fields=' +
          fields +
          '&sort=id&limit=' +
          counter +
          '&filter={"category":{"_eq":' +
          category.oldId +
          '}}',
      )
    ).data.data;

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const filter = {
        rent: this.generateMinMaxFilter(result.min_rent, result.max_rent), //DONE
        income: this.generateMinMaxFilter(result.min_income, result.max_income), //DONE
        childrenCount: this.generateMinMaxFilter(
          result.min_children_count,
          result.max_children_count,
        ), //DONE
        childrenAge: this.generateMinMaxFilter(result.min_age, result.max_age), //DONE
        parentAge: this.generateMinMaxFilter(
          result.min_mother_age,
          result.max_mother_age,
        ), //DONE
        parentGender: result.parent_gender ? [result.parent_gender] : [],
        zips: this.transformPostalCodes(result), // DONE
        regions: regionIds[result.region] ? [regionIds[result.region]] : [], // DONE
        requiredKeys: this.transformKeyWords(result), //DONE
        insurances: result.has_insurance.map(
          (i) => insuranceIds[i.insurance_id],
        ), //DONE
        relationships: result.has_relationship.map(
          (i) => i.relationship_types_id,
        ), //DONE
        jobRelatedSituations: result.has_job_related_situation.map(
          (i) => i.job_related_situations_id,
        ), //DONE
        variables: {},
        actions: [],
      };

      const r: any = {
        _id: new mongoose.Types.ObjectId(),
        oldId: +result.id,
        specific: result.specific,
        timespan: { from: result.start_date, to: result.end_date }, //DONE
        categories: [category._id], //DONE
        type: {
          6: 0,
          1: 1,
          4: 2,
          10: 3,
          2: 4,
          9: 5,
        }[result.type.id], //DONE
        amountOfMoney: this.generateMinMaxFilter(
          result.min_amount_of_money,
          result.max_amount_of_money,
        ), //DONE
        filters: [],
        content: {
          de: {
            name: result.name,
            description: result.description,
            shortDescription: result.short_description,
          },
        },
        status: result.status,
        sort: result.sort,
        actions: [],
        locations: locationIds[result.location]
          ? [locationIds[result.location]]
          : [],
      };
      const userUpdated: User = users.find((user) => {
        return user.oldId == results[j].user_updated;
      });
      if (userUpdated) {
        r.updated = {
          by: userUpdated._id,
          date: results[j].date_updated,
        };
        filter['updated'] = {
          by: userUpdated._id,
          date: results[j].date_updated,
        };
      }
      const userCreated: User = users.find((user) => {
        return user.oldId == results[j].user_created;
      });
      if (userCreated) {
        r.created = {
          by: userCreated._id,
          date: results[j].date_created,
        };
        filter['created'] = {
          by: userCreated._id,
          date: results[j].date_created,
        };
      }

      for (let i = 0; i < result.actions.length; i++) {
        const action = await this.actionModel
          .findOne({ oldId: result.actions[i].action_id }, ['results'])
          .exec();
        if (action) {
          r.actions.push(action._id);
        }
      }
      if (result.russian != null) {
        r.content['ru'] = {
          name: result.russian.name,
          description: result.russian.description,
          shortDescription: result.russian.short_description,
        };
      }
      if (result.ukrainian != null) {
        r.content['uk'] = {
          name: result.ukrainian.name,
          description: result.ukrainian.description,
          shortDescription: result.ukrainian.short_description,
        };
      }
      await new this.filterModel(filter).save((err, filter) => {
        if (filter._id) {
          r.filters.push(filter._id);
          new this.resultModel(r).save();
        }
      });
    }
    return results;
  }
}
