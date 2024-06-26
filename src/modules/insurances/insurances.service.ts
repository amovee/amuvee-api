import { Injectable , NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MetaDocument } from 'src/shared/schemas/meta.schema';
import axios from 'axios';
import { Insurance } from 'src/shared/schemas/insurance.schema';
import { CounterService } from '../counters/counters.service';
import {createInsurance, updateInsurance} from 'src/shared/dtos/insurances.dto';
import { State } from 'src/shared/dtos/types.dto';

@Injectable()
export class InsurancesService {    
  constructor(
    @InjectModel('Insurance')
    private insuranceModel: Model<MetaDocument>,
    private counter: CounterService
  ) {}
  
  async migrate(): Promise<void> {
    await this.counter.deleteSequenzDocument('insurances')
    await this.insuranceModel.deleteMany().exec();
    const insurances =  (await axios.get(process.env.DIRECTUS_URL + 'items/insurance')).data.data
    for (const insurance of insurances) {
      const newInsurance = new this.insuranceModel({
        id: await this.counter.setMaxSequenceValue('insurances', insurance.id),
        status: State.published,
        sort: insurance.weight,
        isPublic: insurance.type == '1',
        name: { de: insurance.name, ru: insurance.name, uk: insurance.name },
      });
      await newInsurance.save();
    }
  }
  async getAll(): Promise<Insurance[]> {
    return this.insuranceModel.find();
  }
  async getAllInsurances(limit: number, skip: number): Promise<Insurance[]> {
    const documents = await this.insuranceModel.find().limit(limit).skip(skip);
    return documents.map(doc => doc.toObject() as Insurance);
  }
  async createInsurance(insurance: createInsurance): Promise<Insurance> {
    const newInsurance = new this.insuranceModel(insurance);
    newInsurance.id = await this.counter.getNextSequenceValue('insurances');
    const savedInsurance = await newInsurance.save();
    return savedInsurance.toObject() as Insurance;
  }
  async updateInsurance(insurance: updateInsurance, id: string): Promise<Insurance> {
    const insuranceToUpdate = await this.insuranceModel.findOne({_id: id});
    if (!insuranceToUpdate) {
      throw new NotFoundException('Insurance not found');
    }

    const updatedInsurance = await this.insuranceModel.findOneAndUpdate({_id: id}, insurance, { new: true });
    return updatedInsurance ? updatedInsurance.toObject() as Insurance : null;
  }
  async getById(id: string): Promise<Insurance> {
    const insurance = await this.insuranceModel.findOne({_id: id});
    if (!insurance) {
      throw new NotFoundException('Insurance not found');
    }
    return insurance.toObject() as Insurance;
  }
  async deleteInsurance(id: string) {
    const insuranceToDelete = await this.insuranceModel.findOne({_id: id});
    if (!insuranceToDelete) {
      throw new NotFoundException('Insurance not found');
    }
    return await this.insuranceModel.deleteOne({_id: id});
  }
  async getCount(): Promise<{totalCount: number}> {
    return {totalCount: await this.insuranceModel.countDocuments()};
  }

}