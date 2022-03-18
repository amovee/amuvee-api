import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Result, ResultDocument } from 'src/shared/schemas/result.schema';
import { Model } from 'mongoose';
import { Region, RegionDocument } from 'src/shared/schemas/region.schema';
import { IAnswers } from 'src/shared/interfaces/answers.interface';
import {
  generateChildrenAge,
  generateChildrenCountFilter,
  generateIncomeMaxFilter,
  generateIncomeMinFilter,
  generateInsuranceFilter,
  generateJobSituationFilter,
  generateRegionFilter,
  generateRelationships,
  generateRentFilter,
  generateRequiredKeywordsFilter,
  generateUnrequiredKeywordsFilter,
} from './results.filters';
import { Action, ActionDocument } from 'src/shared/schemas/action.schema';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
  ) {}

  async getAllFilters(categoryId: string, answers: IAnswers): Promise<any> {
    let regions = await this.regionModel
      .find({ postalCodes: { $in: [answers.zip] } })
      .exec();

    let filters = [];
    /**
     * FILTER END DATE
     */
    filters.push({
      $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
    });
    filters.push({
      $or: [
        { startDate: null },
        {
          startDate: {
            $lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 4),
          },
        },
      ],
    });

    /**
     * FILTER REGION
     */
    if (answers.zip)
      filters.push(
        generateRegionFilter(
          answers.zip,
          regions.map((region) => region._id),
        ),
      );
    /**
     * FILTER CATEGORY
     */
    if (categoryId != null) filters.push({ categoryId: categoryId });
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
    if (answers.childrenCount != null)
      filters.push(generateChildrenCountFilter(answers.childrenCount));
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
    if (answers.relationship != null) {
      // TODO: test
      filters.push(generateRelationships(answers.relationship));
    }
    /**
     * FILTER JOB_SITUAZTION
     */
    if (answers.jobSituation != null) {
      // TODO: test
      filters.push(generateJobSituationFilter(answers.jobSituation));
    }
    return { $and: filters };
  }
  async getFilteredResult(
    categoryId: string,
    answers: IAnswers,
    limit: number,
    offset: number,
    projection: any = {},
  ): Promise<any> {
    return await this.resultModel
      .find(await this.getAllFilters(categoryId, answers), projection)
      .skip(offset)
      .limit(limit)
      .exec();
  }
  async getFilteredActions(
    resultId: string,
    projection: any = {},
  ): Promise<any> {
    const actionIds = (await this.resultModel
      .findOne({_id: resultId}).exec()).actions;
    return await this.actionModel
    .find({
      '_id': {
        $in: actionIds,
      },
    }, projection).exec();
  }
  async getFilteredResultCount(
    categoryId: string,
    answers: IAnswers,
  ): Promise<number> {
    return await this.resultModel
      .count(await this.getAllFilters(categoryId, answers))
      .exec();
  }
}
