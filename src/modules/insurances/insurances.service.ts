import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MetaDocument } from '../../schemas/meta.schema';
import axios from 'axios';
import { Insurance } from './insurance.schema';
import { CounterService } from '../counters/counters.service';

@Injectable()
export class InsurancesService {    
  constructor(
    @InjectModel('Insurance')
    private insuranceModel: Model<MetaDocument>,
    private counter: CounterService
  ) {}
  
  async migrate(): Promise<void> {
    await this.insuranceModel.deleteMany().exec();
    (await axios.get(process.env.DIRECTUS_URL + 'items/insurance')).data.data.forEach(
      async (insurance) => {
        new this.insuranceModel({
          id: await this.counter.setMaxSequenceValue('insurances', insurance.id),
          status: 'published',
          sort: insurance.weight,
          isPublic: insurance.type == '1',
          name: insurance.name,
        }).save();
      }
    );
  }
  async getAll(): Promise<Insurance[]> {
    return this.insuranceModel.find();
  }
}