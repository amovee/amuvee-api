import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Model } from 'mongoose';
import { LocationDocument, Location } from 'src/shared/schemas/location.schema';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
  ) {}

  async findOne(id: string): Promise<Location> {
    return await this.locationModel.findOne({_id: new mongoose.Types.ObjectId(id)}).exec();
  }
}
