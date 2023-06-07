import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { LocationDocument, Location } from 'src/shared/schemas/location.schema';
import axios from 'axios';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { CounterService } from '../counters/counters.service';
import { migrateRoles } from 'src/types/roles.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly counter: CounterService
  ) {}

  async getAll(limit: number, skip: number): Promise<Location[]> {
    return await this.locationModel.find().limit(limit).skip(skip);
  }

  async migrate(): Promise<void> {
    await this.counter.deleteSequenzDocument('locations')
    await this.locationModel.deleteMany().exec();
    const users: User[] = await this.userModel.find().exec();

    const locations = (
      await axios.get(process.env.DIRECTUS_URL + 'items/location')
    ).data.data;
    if (!locations) return;
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const loc: any = {
        _id: new mongoose.Types.ObjectId(),
        address: {
          street: location.street_name,
          houseNr: location.house_nr,
          zip: location.zip,
          place: location.location_name,
        },
        link: location.google_maps_link,
        name: location.name,
        id: await this.counter.setMaxSequenceValue('locations', +location.id),
        roles: migrateRoles(location, users),
        status: "published",
      };

      const userUpdated: User = users.find((user) => {
        return user.oldId == location.user_updated;
      });
      new this.locationModel(loc).save();
    }
  }
}
