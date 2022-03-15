import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Result, ResultDocument } from 'src/shared/schemas/result.schema';
import { Model } from 'mongoose';
import { Region, RegionDocument } from 'src/shared/schemas/region.schema';
import { Answers } from 'src/shared/interfaces/answers.interface';
import { generateChildrenAge, generateChildrenCountFilter, generateIncomeMaxFilter, generateIncomeMinFilter, generateInsuranceFilter, generateJobSituationFilter, generateRegionFilter, generateRelationships, generateRentFilter, generateRequiredKeywordsFilter, generateUnrequiredKeywordsFilter } from './results.filters';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
  ) {}

  async getFilteredResult(categoryId: string, answers: Answers, limit: number, offset: number): Promise<any> {
    let regions = await this.regionModel.find({ postalCodes: { $in: [answers.zip] } }).exec();

    let filters = [];
    /**
     * FILTER REGION
     */
    if (answers.zip) filters.push(generateRegionFilter(answers.zip, regions.map((region) => region._id)));
    /**
     * FILTER CATEGORY
     */
    if (categoryId != null) filters.push({categoryId: categoryId});
    /**
     * FILTER: KEYWORDS
     */
    if (answers.keywords != null) {
      filters.push(generateUnrequiredKeywordsFilter(answers.keywords));
      filters.push(generateRequiredKeywordsFilter(answers.keywords));
    }
    /**
     * FILTER: RENT
     */
    if (answers.rent != null) filters.push(generateRentFilter(answers.rent));
    /**
     * FILTER: INCOME
     */
    if (answers.income != null) {
      filters.push(generateIncomeMinFilter(answers.income));
      filters.push(generateIncomeMaxFilter(answers.income));
    }
    /**
     * FILTER CHILDREM_COUNT
     */
    if (answers.childrenCount != null) filters.push(generateChildrenCountFilter(answers.childrenCount));
    /**
     * FILTER CHILDREM_AGE
     */
    if (answers.childrenAge != null) {
      if (answers.childrenAge.min != null) {
        filters.push(generateChildrenAge(answers.childrenAge.min));
      }
      if (answers.childrenAge.max != null) {
        filters.push(generateChildrenAge(answers.childrenAge.max));
      }
    }
    /**
     * FILTER INSURANCE
     */
    if (answers.insurance != null) {
      filters.push(generateInsuranceFilter(answers.insurance));
    }
    /**
     * FILTER RELATIONSHIP
     */
    if (answers.relationship != null) { // TODO: test
      filters.push(generateRelationships(answers.relationship));
    }
    /**
     * FILTER JOB_SITUAZTION
     */
    if (answers.jobSituation != null) { // TODO: test
      filters.push(generateJobSituationFilter(answers.jobSituation));
    }
    return await this.resultModel
      .find({ $and: filters }).skip(offset).limit(limit).exec();
  }
}
