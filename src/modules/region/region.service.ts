import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Region, RegionDocument } from '../../schemas/region.schema';
import { CounterService } from '../counters/counters.service';
import { regions } from './regions';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    private readonly counter: CounterService
  ) {}
  async searchString(text: string): Promise<any> {
    return await this.regionModel.find({"$or": [{ "name" : { "$regex": "^.*"+text+".*$"} }, { zips: { "$elemMatch": { "$regex": "^"+text+".*$"}}}]}).limit(5);
  }
  async migrate(): Promise<any> {
    await this.regionModel.deleteMany().exec();
    for (let i = 0; i < regions.length; i++) {
      new this.regionModel({
        id: await this.counter.setMaxSequenceValue('regions', +regions[i].id),
        status: 'published',
        zips: regions[i].postalCodes,
        name: regions[i].name,
      }).save();
    }
    return 'done';
  }
}
