import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import mongoose, {Model} from "mongoose";
import {CounterService} from "../counters/counters.service";
import {ResultType,Result, ResultTypeDocument, ResultDocument} from "../../shared/schemas/result.schema";
import {CreateResultTypeDTO, UpdateResultTypeDTO} from "../../shared/dtos/results.dto";
@Injectable()
export class ResultTypeService {
  constructor(
    @InjectModel(ResultType.name) private resultTypeModel: Model<ResultTypeDocument>,
    @InjectModel(Result.name) private resultsModel: Model<ResultDocument>,
    private counter: CounterService
  ) {}

  async getAllResultTypes(limit: number, skip: number): Promise<ResultType[]> {
    return this.resultTypeModel.find().limit(limit).skip(skip);
  }

  async getResultType(_id: string): Promise<ResultType> {
    return this.resultTypeModel.findById(_id);
  }

  async deleteResultType(_id: string): Promise<any> {
    const resultType = await this.resultTypeModel.findOne({_id: _id});
    if (!resultType) {
      throw new Error('Result type not found');
    }
    const isTypeExist =  await this.resultsModel.findOne({type: _id})
    if (isTypeExist) {
      throw new Error('Result type is used in results');
    }
    return this.resultTypeModel.findByIdAndDelete(_id);
  }

  async  updateResultType(id: string, body: UpdateResultTypeDTO): Promise<ResultType> {
    return this.resultTypeModel.findOneAndUpdate({_id: id}, body, {new: true})
  }

  async createResultType(body: CreateResultTypeDTO): Promise<ResultType> {
    const id = await this.counter.getNextSequenceValue('resultType');
    const newResultType: any = new this.resultTypeModel({...body, id: id});
    newResultType._id = new mongoose.Types.ObjectId();
    return newResultType.save();
  }
  async getCount(): Promise<{totalCount: number}> {
    return {totalCount: await this.resultTypeModel.countDocuments()};
  }

  async getUsedResultTypes(id: string): Promise<{TotalUsageCount: number}> {
    const resultType = this.resultTypeModel.findById(id);
    if (!resultType) {
      throw new Error('Result type not found');
    }
    const rere = await this.resultsModel.find({type: id});
    return {TotalUsageCount: rere.length};
  }

}
