import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { LocationDocument, Location } from 'src/shared/schemas/location.schema';
import axios from 'axios';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { CounterService } from '../counters/counters.service';
import { HistoryEventType, migrateRoles } from 'src/shared/dtos/roles.dto';
import { CreateLocationDTO, LocationDTO, UpdateLocationDTO } from 'src/shared/dtos/locations.dto';
import { UsersService } from '../users/users.service';
import { State, StateType } from 'src/shared/dtos/types.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    public userService: UsersService,
    private readonly counter: CounterService
  ) {}

  async getAll(limit: number, skip: number): Promise<Location[]> {
    return await this.locationModel.find().sort({ "id": 1 }).limit(limit).skip(skip);
  }

  async getNumberOfAllLocations() {
    return (
      await axios.get(
        `${process.env.DIRECTUS_URL}items/location?fields=*&limit=0&meta=filter_count`,
      )
    ).data.meta.filter_count;
  }
  async migrate(): Promise<void> {
    await this.counter.deleteSequenzDocument('locations')
    await this.locationModel.deleteMany().exec();
    const admin = await this.userModel.findOne({ name: 'admin' }).exec();
    const counter = await this.getNumberOfAllLocations();
    const locations = (
      await axios.get(process.env.DIRECTUS_URL + 'items/location?sort=id&limit=' + counter)
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
        roles: {
          author: undefined,
          reviewer: undefined,
        },
        history: [],
        status: State.published,
      };
      if (location.user_created) {
        let userCreated = await this.userModel.findOne({ oldId: location.user_created }).exec();
        if (!userCreated) {
          userCreated = admin;
        }
        loc.roles.author = userCreated._id;
        loc.history.push({
          by: userCreated._id,
          date: location.date_created,
          eventType: HistoryEventType.created,
        });

      }
      if (location.user_updated) {
        const userUpdated = await this.userModel.findOne({ oldId: location.user_updated }).exec();
        if (userUpdated) {
          loc.roles.author = userUpdated._id;
          loc.history.push({
            by: userUpdated._id,
            date: location.date_updated,
            eventType: HistoryEventType.updated,
            value: 'Last update by Directus UI',
          });
        }
      }
      loc.history.push({
        by: admin._id,
        date: new Date().toISOString(),
        eventType: HistoryEventType.migrated,
        value: 'Migrated from Directus',
      });
      new this.locationModel(loc).save();
    }
  }
  async getCounter(
  ): Promise<any> {
    const totalCount = await this.locationModel.countDocuments();
    return { totalCount };
  }

  async getOneFromId(
    id: string,
  ): Promise<LocationDTO | undefined> {
    if (isNaN(+id)) {
      return await this.locationModel.findById(new mongoose.Types.ObjectId(id))
    }
    return await this.locationModel.findOne({ id: +id })
  }


  async create(location: CreateLocationDTO, userId: string) {
    const id = await this.counter.getNextSequenceValue('locations');
    const roles = { roles: { author: userId } }
    const history = {
      by: userId,
      date: new Date().toISOString(),
      eventType: HistoryEventType.created,
    }
    const newLocation = new this.locationModel({ ...location, ...roles, id, history });
    newLocation._id = new mongoose.Types.ObjectId();
    return newLocation.save();
  }
  async update(_id: string, changes: UpdateLocationDTO, userId: string) {
    const location = await this.getOneFromId(_id)
    if(location) {
      location.history.push({
      by: userId,
      date: new Date().toISOString(),
      eventType: HistoryEventType.updated,
    })
      return await this.locationModel.findByIdAndUpdate({ _id }, {...changes, history: [...location.history]});
    }

    return null;
  }

  async delete(id: string): Promise<any> {
    let location;
    if (isNaN(+id)) {
      location = await this.locationModel.findById(new mongoose.Types.ObjectId(id))
    } else {
      location = await this.locationModel.findOne({ id: +id });
    }
    if (!location) {
      throw new Error('Result type not found');
    }
    // TODO: check if location is used
    // const isTypeExist =  await this.resultsModel.findOne({type: _id})
    // if (isTypeExist) {
    //   throw new Error('Result type is used in results');
    // }
    return this.locationModel.findByIdAndDelete(location._id);
  }
}
