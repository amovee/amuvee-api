import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Region, RegionDocument } from 'src/shared/schemas/region.schema';
import { CounterService } from '../counters/counters.service';
import { regions } from './regions';
import axios from 'axios';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    private readonly counter: CounterService,
  ) {}
  async getById(id: string) {
    return this.regionModel.findById(id);
  }
  async searchString(text: string, limit: number, skip: number): Promise<any> {
    return await this.regionModel
      .find({
        $or: [
          { name: { $regex: '^.*' + text + '.*$', $options: '-i' } },
          { zips: { $elemMatch: { $regex: '^' + text + '.*$' } } },
        ],
      })
      .limit(limit)
      .skip(skip);
  }
  async migrate(): Promise<any> {
    await this.counter.deleteSequenzDocument('regions');
    await this.regionModel.deleteMany().exec();
    for (let i = 0; i < regions.length; i++) {
      new this.regionModel({
        id: await this.counter.setMaxSequenceValue('regions', +regions[i].id),
        status: 'published',
        zips: regions[i].postalCodes.join(', '),
        name: regions[i].name,
      }).save();
    }
    let results = (
      await axios.get(
        `${process.env.DIRECTUS_URL}items/result?fields=zip,id&sort=id&limit=5000`,
      )
    ).data.data;
    results = results
      .filter((res) => !!res.zip)
      .map((item) =>
        item.zip.replaceAll(' ', '').replaceAll('\n', '').replaceAll(',,', ','),
      ) // extract zip values
      .filter((zip, index, array) => array.indexOf(zip) === index);
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      new this.regionModel({
        id: await this.counter.getNextSequenceValue('regions'),
        status: 'published',
        zips: res,
        name: `Temporäre Region ${i}`,
      }).save();
    }
    return 'done';
  }
}
