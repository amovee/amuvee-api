import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { IUser } from 'src/shared/interfaces/user.interface';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from 'src/shared/schemas/category.schema';
import { MetaDocument } from 'src/shared/schemas/meta.schema';
import { Result, ResultDocument } from 'src/shared/schemas/result.schema';
import {
  Insurance,
  InsuranceDocument,
} from 'src/shared/schemas/insurance.schema';
import { LocationDocument, Location } from 'src/shared/schemas/location.schema';
import { regions } from './regions';
import { Region, RegionDocument } from 'src/shared/schemas/region.schema';
import mongoose from 'mongoose';

@Injectable()
export class MigrationService {
  private URL = 'https://afq-t32f44ncfa-ey.a.run.app/';

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Insurance.name)
    private insuranceModel: Model<InsuranceDocument>,
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
    @InjectModel('ResultType') private resultTypeModel: Model<MetaDocument>,
    @InjectModel('RelationshipType')
    private relationshipTypeModel: Model<MetaDocument>,
    @InjectModel('JobRelatedSituation')
    private jobRelatedSituationModel: Model<MetaDocument>,
  ) {}

  generatePassword(len: number): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let retVal = '';
    for (var i = 0, n = charset.length; i < len; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }
  async migrateUsers(): Promise<any> {
    let users = (await axios.get(this.URL + 'items/users')).data.data;
    if (users) {
      users = users.map((user) => ({
        username: user.last_name + '' + user.first_name,
        password: this.generatePassword(15),
        role: 'admin',
        oldId: user.id,
        email: user.email,
      }));
      for (let i = 0; i < users.length; i++) {
        await this.migrateUser(users[i]);
      }
    }
    return users.map((user) => ({
      username: user.username,
      password: user.password,
    }));
  }
  async migrateUser(toCreate: IUser): Promise<User> {
    const user = await this.userModel
      .findOne({ username: toCreate.username })
      .exec();
    if (user == null) {
      if (!toCreate || !toCreate.username || !toCreate.password) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'User not Complete',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      return new this.userModel({
        username: toCreate.username,
        password: toCreate.password,
        role: toCreate.role,
        oldId: toCreate.oldId,
        email: toCreate.email,
      }).save();
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'user already exists',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
  async migrateResultTypes(): Promise<any> {
    await this.resultTypeModel.deleteMany().exec();
    let resultTypes = (await axios.get(this.URL + 'items/result_type')).data
      .data;
    resultTypes = resultTypes.map((resultType) => {
      return {
        oldId: resultType.id,
        status: resultType.status,
        sort: resultType.weight,
        userCreated: resultType.user_created,
        dateCreated: resultType.date_created,
        userUpdated: resultType.user_updated,
        dateUpdated: resultType.date_updated,
        name: resultType.name,
      };
    });
    for (let i = 0; i < resultTypes.length; i++) {
      const userCreated = await this.userModel
        .findOne({ oldId: resultTypes[i].userCreated }, ['_id'])
        .exec();
      const userUpdated = await this.userModel
        .findOne({ oldId: resultTypes[i].userUpdated }, ['_id'])
        .exec();
      resultTypes[i].userCreated = !!userCreated ? userCreated._id : null;
      resultTypes[i].userUpdated = !!userUpdated ? userUpdated._id : null;

      new this.resultTypeModel(resultTypes[i]).save();
    }
    return resultTypes;
  }
  async migrateLocations(): Promise<any> {
    await this.locationModel.deleteMany().exec();
    let locations = (await axios.get(this.URL + 'items/location')).data.data;
    locations = locations.map((location) => {
      return {
        address: {
          street: location.street_name,
          houseNr: location.house_nr,
          zip: location.zip,
          place: location.location_name,
        },
        description: location.description,
        googleMapsLink: location.google_maps_link,

        oldId: location.id,
        status: location.status,
        sort: location.sort,
        userCreated: location.user_created,
        dateCreated: location.date_created,
        userUpdated: location.user_updated,
        dateUpdated: location.date_updated,
        name: location.name,
      };
    });
    for (let i = 0; i < locations.length; i++) {
      const userCreated = await this.userModel
        .findOne({ oldId: locations[i].userCreated }, ['_id'])
        .exec();
      const userUpdated = await this.userModel
        .findOne({ oldId: locations[i].userUpdated }, ['_id'])
        .exec();
      locations[i].userCreated = !!userCreated ? userCreated._id : null;
      locations[i].userUpdated = !!userUpdated ? userUpdated._id : null;

      new this.locationModel(locations[i]).save();
    }
    return locations;
  }

  async migrateRegions(): Promise<any> {
    await this.regionModel.deleteMany().exec();
    const system = await this.userModel
      .findOne({ role: 'system' }, ['_id'])
      .exec();
    const now = new Date(Date.now());
    for (let i = 0; i < regions.length; i++) {
      new this.regionModel({
        oldId: regions[i].id,
        status: 'published',
        postalCodes: regions[i].postalCodes,
        sort: i,
        userCreated: system._id,
        dateCreated: now,
        userUpdated: system._id,
        dateUpdated: now,
        name: regions[i].name,
      }).save();
    }
    return 'done';
  }
  async migrateInsurances(): Promise<any> {
    await this.insuranceModel.deleteMany().exec();
    let insurances = (await axios.get(this.URL + 'items/insurance')).data.data;
    const system = await this.userModel
      .findOne({ role: 'system' }, ['_id'])
      .exec();
    const now = new Date(Date.now());
    insurances = insurances.map((insurance) => {
      return {
        oldId: insurance.id,
        status: 'published',
        sort: insurance.weight,
        isPublic: insurance.type == '1',
        userCreated: system._id,
        dateCreated: now,
        userUpdated: system._id,
        dateUpdated: now,
        name: insurance.name,
      };
    });
    for (let i = 0; i < insurances.length; i++) {
      new this.insuranceModel(insurances[i]).save();
    }
    return insurances;
  }
  async migrateRelationshipTypes(): Promise<any> {
    await this.relationshipTypeModel.deleteMany().exec();
    let relationshipTypes = (
      await axios.get(this.URL + 'items/relationship_types')
    ).data.data;
    const system = await this.userModel
      .findOne({ role: 'system' }, ['_id'])
      .exec();
    const now = new Date(Date.now());
    let i = 1;
    relationshipTypes = relationshipTypes.map((relationshipType) => {
      return {
        oldId: relationshipType.id,
        status: 'published',
        sort: i++,
        userCreated: system._id,
        dateCreated: now,
        userUpdated: system._id,
        dateUpdated: now,
        name: relationshipType.name,
      };
    });
    for (let i = 0; i < relationshipTypes.length; i++) {
      new this.relationshipTypeModel(relationshipTypes[i]).save();
    }
    return relationshipTypes;
  }
  async migrateJobRelatedSituations(): Promise<any> {
    await this.jobRelatedSituationModel.deleteMany().exec();
    let jobRelatedSituations = (
      await axios.get(this.URL + 'items/job_related_situations')
    ).data.data;
    const system = await this.userModel
      .findOne({ role: 'system' }, ['_id'])
      .exec();
    const now = new Date(Date.now());
    let i = 1;
    jobRelatedSituations = jobRelatedSituations.map((jobRelatedSituation) => {
      return {
        oldId: jobRelatedSituation.id,
        status: 'published',
        sort: i++,
        userCreated: system._id,
        dateCreated: now,
        userUpdated: system._id,
        dateUpdated: now,
        name: jobRelatedSituation.name,
      };
    });
    for (let i = 0; i < jobRelatedSituations.length; i++) {
      new this.jobRelatedSituationModel(jobRelatedSituations[i]).save();
    }
    return jobRelatedSituations;
  }
  transformPostalCodes(result: any): string[] {
    let postalcodes = [];
    if (result.zip) {
      postalcodes = result.zip.split(',');
    } else if (result.postalcodes) {
      postalcodes = result.postalcodes.split(',');
    }
    return postalcodes;
  }
  transformRegions(result: any): string[] {
    let regions = [];
    // TODO: save Region in collection
    return regions;
  }
  transformKeyWords(result): string[] {
    let keywords = [];
    if (result.is_pregnant) {
      keywords.push('pregnant');
    }
    if (result.victim_of_violence) {
      keywords.push('victim_of_violence');
    }
    return keywords;
  }
  async migrateResultsFromAllCategories(): Promise<any> {
    await this.resultModel.deleteMany().exec();
    const categories = await this.categoryModel.find().exec();
    categories.forEach(async (category) => {
      await this.migrateResults(category.oldId);
    });
    return 'done';
  }
  async migrateResults(oldId: string): Promise<any> {
    const category = await this.categoryModel
      .findOne({ oldId }, ['_id'])
      .exec();
    const locationIds: any = {};
    const locations = await this.locationModel.find().exec();
    locations.forEach((location) => {
      locationIds[location.oldId] = location._id;
    });
    const regionIds: any = {};
    const regions = await this.regionModel.find().exec();
    regions.forEach((region) => {
      regionIds[region.oldId] = region._id;
    });
    const types: any = {};
    const resultTypes = await this.resultTypeModel.find().exec();
    resultTypes.forEach((type) => {
      types[type.oldId] = type._id.toString();
    });
    
    
    const insuranceIds: any = {};
    const insurances = await this.insuranceModel.find().exec();
    insurances.forEach((insurance) => {
      insuranceIds[insurance.oldId] = insurance._id;
    });
    const relationshipTypeIds: any = {};
    const relationshipTypes = await this.relationshipTypeModel.find().exec();
    relationshipTypes.forEach((relationshipType) => {
      relationshipTypeIds[relationshipType.oldId] = relationshipType._id;
    });
    const jobRelatedSituationIds: any = {};
    const jobRelatedSituations = await this.jobRelatedSituationModel
      .find()
      .exec();
    jobRelatedSituations.forEach((jobRelatedSituation) => {
      jobRelatedSituationIds[jobRelatedSituation.oldId] =
        jobRelatedSituation._id;
    });
    const fields =
      '*,has_insurance.*,has_relationship.*,has_job_related_situation.*,relationship_types.*,type.*';
    let results = (
      await axios.get(
        this.URL +
          'items/' +
          'result?fields=' +
          fields +
          '&filter={"category":{"_eq":' +
          oldId +
          '}}',
      )
    ).data.data;    
    results = results.map((result) => {
      return {
        startDate: result.start_date,
        endDate: result.end_date,
        description: result.description,
        shortDescription: result.short_description,
        categoryId: category._id,
        typeId: types[result.type.id], //relation
        locationId: locationIds[result.location], //relation
        amountOfMoney: {
          min: result.min_amount_of_money,
          max: result.max_amount_of_money,
        },
        filter: {
          rent: { min: result.min_rent, max: result.max_rent },
          income: { min: result.min_income, max: result.max_income },
          childrenCount: {
            min: result.min_children_count,
            max: result.max_children_count,
          },
          childrenAge: { min: result.min_age, max: result.max_age },
          motherAge: { min: result.min_mother_age, max: result.max_mother_age },
          zips: this.transformPostalCodes(result), // postalcodes || zip
          regions: regionIds[result.region], // Save Region as Module
          requiredKeywords: this.transformKeyWords(result), // victimOfViolence, pregnant
          unrequiredKeywords: [], // victimOfViolence, pregnant
          insurances: result.has_insurance.map(
            (i) => insuranceIds[i.insurance_id],
          ),
          relationships: result.has_relationship.map(
            (i) => relationshipTypeIds[i.relationship_types_id],
          ),
          jobSituations: result.has_job_related_situation.map(
            (i) => jobRelatedSituationIds[i.job_related_situations_id],
          ),
        },

        oldId: result.id,
        status: result.status,
        sort: result.sort,
        userCreated: result.user_created,
        dateCreated: result.date_created,
        userUpdated: result.user_updated,
        dateUpdated: result.date_updated,
        name: result.name,
      };
    });
    for (let i = 0; i < results.length; i++) {
      const userCreated = await this.userModel
        .findOne({ oldId: results[i].userCreated }, ['_id'])
        .exec();
      const userUpdated = await this.userModel
        .findOne({ oldId: results[i].userUpdated }, ['_id'])
        .exec();
      results[i].userCreated = !!userCreated ? userCreated._id : null;
      results[i].userUpdated = !!userUpdated ? userUpdated._id : null;

      new this.resultModel(results[i]).save();
    }
    return results;
  }
  async migrateCategories(): Promise<any> {
    await this.categoryModel.deleteMany().exec();
    let categories = (await axios.get(this.URL + 'items/category')).data.data;
    if (categories) {
      categories = categories.map((category) => {
        return {
          description: category.description,
          oldId: category.id,
          status: category.status,
          sort: category.sort,
          userCreated: category.user_created,
          dateCreated: category.date_created,
          userUpdated: category.user_updated,
          dateUpdated: category.date_updated,
          name: category.name,
        };
      });
      for (let i = 0; i < categories.length; i++) {
        const userCreated = await this.userModel
          .findOne({ oldId: categories[i].userCreated }, ['_id'])
          .exec();
        const userUpdated = await this.userModel
          .findOne({ oldId: categories[i].userUpdated }, ['_id'])
          .exec();
        categories[i].userCreated = !!userCreated ? userCreated._id : null;
        categories[i].userUpdated = !!userUpdated ? userUpdated._id : null;
        new this.categoryModel(categories[i]).save();
      }
    }
    return categories;
  }
}
