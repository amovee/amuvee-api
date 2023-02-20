import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MetaDocument } from '../../schemas/meta.schema';
import axios from 'axios';
import { Insurance } from './insurance.schema';


@Injectable()
export class InsurancesService {    
  constructor(
    @InjectModel('Insurance')
    private insuranceModel: Model<MetaDocument>,
  ) {}
  
  async migrate(): Promise<void> {
    await this.insuranceModel.deleteMany().exec();
    (await axios.get(process.env.DIRECTUS_URL + 'items/insurance')).data.data.forEach(
      (insurance) => {
        new this.insuranceModel({
          oldId: +insurance.id,
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