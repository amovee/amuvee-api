import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Region, RegionDocument } from '../../schemas/region.schema';
import { regions, zips } from './regions';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>
  ) {}
  async searchString(text: string): Promise<any> {
    return await this.regionModel.find({"$or": [{ "name" : { "$regex": "^.*"+text+".*$"} }, { zips: { "$elemMatch": { "$regex": "^"+text+".*$"}}}]}).limit(5);
  }
  async migrate(): Promise<any> {
    await this.regionModel.deleteMany().exec();
    for (let i = 0; i < regions.length; i++) {
      new this.regionModel({
        id: regions[i].id,
        status: 'published',
        zips: regions[i].postalCodes,
        name: regions[i].name,
      }).save();
    }

    /**
     * TODO: load Zips
     */
    // for (let i = 0; i < zips.length; i++) {
    //   const zip = zips[i];
    //   if (zip[3] != 'Berlin' && zip[3] != 'Hamburg' && zip[3] != 'Bremen') {
    //     const region: Region = await this.regionModel.findOne({
    //       name: { $eq: zip[3] },
    //     });
    //     if (region) {
    //       region.zips.push(zip[2] + '');
    //       if (!region.position) {
    //         region.position = { lon: <number>zip[4], lat: <number>zip[5] };
    //       }
    //       await this.regionModel.findOneAndUpdate(
    //         { name: { $eq: zip[3] } },
    //         region
    //       );
    //     } else {
    //       const r = new this.regionModel({
    //         id: zip[1],
    //         status: 'published',
    //         zips: [zip[2]],
    //         name: zip[3],
    //         position: { lon: <number>zip[4], lat: <number>zip[5] },
    //       });
    //       await r.save();
    //     }
    //   }
    // }
    return 'done';
  }
}
