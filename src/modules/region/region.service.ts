import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Region, RegionDocument } from 'src/shared/schemas/region.schema';
import { CounterService } from '../counters/counters.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { regions } from './regions';
import {
  RegionDTO,
  createRegionDTO,
  updateRegionDTO,
} from '../../shared/dtos/region.dto';
import axios from 'axios';
import { State } from 'src/shared/dtos/types.dto';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    private readonly counter: CounterService,
  ) {}
  async getById(id: string) {
    return this.regionModel.findById(id);
  }
  async deleteById(id: string): Promise<RegionDTO> {
    const regionFromDB = await this.regionModel.findById(id);
    if (regionFromDB) {
      return await this.regionModel.findByIdAndDelete<RegionDTO>(id);
    } else {
      throw new HttpException('Region not found', HttpStatus.BAD_REQUEST);
    }
  }
  async updateById(id: string, region: updateRegionDTO) {
    return this.regionModel.findByIdAndUpdate(id, region, { new: true });
  }
  async createRegion(region: createRegionDTO) {
    const regionFromDB = await this.regionModel.findOne({ name: region.name });
    if (regionFromDB) {
      throw new HttpException(
        'Region with the same name already exists',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      region.id = await this.counter.getNextSequenceValue('regions');
      return new this.regionModel(region).save();
    }
  }

  async getAll(limit: number, skip: number, search?: string): Promise<any> {
    return await this.regionModel
      .find(
        search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { zips: { $regex: search, $options: 'i' } },
              ],
            }
          : {},
      )
      .limit(limit)
      .skip(skip);
  }
  async count(): Promise<{ totalCount: number }> {
    return { totalCount: await this.regionModel.countDocuments() };
  }
  async migrate(): Promise<any> {
    await this.counter.deleteSequenzDocument('regions');
    await this.regionModel.deleteMany().exec();
    for (let i = 0; i < regions.length; i++) {
      new this.regionModel({
        id: await this.counter.setMaxSequenceValue('regions', +regions[i].id),
        status: State.published,
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
        status: State.published,
        zips: res,
        name: `Temporäre Region ${i}`,
      }).save();
    }
    return 'done';
  }
}
