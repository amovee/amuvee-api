import { Injectable, UseGuards } from '@nestjs/common';
import { CounterService } from '../counters/counters.service';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from 'src/shared/schemas/event.schema';
import mongoose, { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { mappingStateType } from 'src/shared/dtos/types.dto';
import { HistoryEventType } from 'src/shared/dtos/roles.dto';
import { CreateEventDTO, EventDTO, UpdateEventDTO } from 'src/shared/dtos/events.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly counter: CounterService,
  ) {}
  async migrate(): Promise<void> {
    await this.counter.deleteSequenzDocument('events');
    await this.eventModel.deleteMany().exec();
    const users: User[] = await this.userModel.find().exec();

    const events = (
      await axios.get<{ data: any[] }>(
        process.env.DIRECTUS_URL + 'items//event',
      )
    ).data.data;
    const combineDate = (date: string, time: string) =>
      new Date(date + 'T' + time);
    const admin = await this.userModel.findOne({ name: 'admin' }).exec();
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const e = {
        _id: new mongoose.Types.ObjectId(),
        id: await this.counter.setMaxSequenceValue('events', +events[i].id),
        status: mappingStateType(event.status),
        link: event.link,
        style: event.style,
        type: event.type,
        image: event.image,
        timespan: {
          from:
            event.start_date && event.start_time
              ? combineDate(event.start_date, event.start_time)
              : null,
          to:
            event.end_date && event.end_time
              ? combineDate(event.end_date, event.end_time)
              : null,
        },
        roles: {
          author: undefined,
          reviewer: undefined,
        },
        history: [],
        name: {de: event.name},
        shortDescription: {de: event.short_description},
      };
      if (event.user_created) {
        let userCreated = await this.userModel
          .findOne({ oldId: event.user_created })
          .exec();
        if (!userCreated) {
          userCreated = admin;
        }
        e.roles.author = userCreated._id;
        e.history.push({
          by: userCreated._id,
          date: event.date_created,
          eventType: HistoryEventType.created,
        });
      }
      if (event.user_updated) {
        const userUpdated = await this.userModel
          .findOne({ oldId: event.user_updated })
          .exec();
        if (userUpdated) {
          e.roles.author = userUpdated._id;
          e.history.push({
            by: userUpdated._id,
            date: event.date_updated,
            eventType: HistoryEventType.updated,
            value: 'Last update by Directus UI',
          });
        }
      }
      e.history.push({
        by: admin._id,
        date: new Date().toISOString(),
        eventType: HistoryEventType.migrated,
        value: 'Migrated from Directus',
      });
      new this.eventModel(e).save();
    }
  }
  async getEvents(filter: { month: number; year: number }): Promise<Event[]> {
    const startOfMonth = new Date(filter.year, filter.month - 1, 1);
    const endOfMonth = new Date(filter.year, filter.month, 0, 23, 59, 59, 999);
    const events = await this.eventModel
      .find({
        'timespan.from': { $lte: endOfMonth },
        'timespan.to': { $gte: startOfMonth },
      })
      .exec();
    return events;
  }
  async getNextTwoDistinctTypeEvents(currentTimestamp: Date): Promise<Event[]> {
    // Find the next two distinct type events after the current timestamp
    const events = await this.eventModel
      .aggregate([
        {
          $match: {
            'timespan.from': { $gte: currentTimestamp },
          },
        },
        {
          $group: {
            _id: '$type',
            event: { $first: '$$ROOT' },
          },
        },
        {
          $replaceRoot: { newRoot: '$event' },
        },
        {
          $limit: 2,
        },
      ])
      .exec();

    return events;
  }
  async countEvents(): Promise<{totalCount: number}> {
    return {totalCount: await this.eventModel.countDocuments()};
  }
  async getListByLimitAndSkip(skip: number, limit: number, search?: string) {
    
    return await this.eventModel.find(search?{
      $or: [
        { 'name.de': { $regex: search, $options: 'i' } },
        { 'name.uk': { $regex: search, $options: 'i' } },
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'shortDescription.de': { $regex: search, $options: 'i' } },
        { 'shortDescription.uk': { $regex: search, $options: 'i' } },
        { 'shortDescription.ru': { $regex: search, $options: 'i' } },
      ],
    }: {}).sort({"id": 1}).limit(limit).skip(skip);
  }
  
  async create(event: CreateEventDTO, userId: string): Promise<Event> {
    const id = await this.counter.getNextSequenceValue('events');
    const roles = { roles: { author: userId } };
    const history = {
      by: userId,
      date: new Date().toISOString(),
      eventType: HistoryEventType.created,
    };
    const newEvent =  new this.eventModel({
      _id: new mongoose.Types.ObjectId(),
      ...event,
      ...roles,
      id,
      history,
    }).save();
    return newEvent;
  }

  async getOneFromId(
    id: string,
  ): Promise<EventDTO | undefined> {
    if (isNaN(+id)) {
      return await this.eventModel.findById(new mongoose.Types.ObjectId(id))
    }
    return await this.eventModel.findOne({ id: +id })
  }

  async update(_id: string, changes: UpdateEventDTO, userId: string) {
    const event = await this.getOneFromId(_id)
    if(event) {
      event.history.push({
      by: userId,
      date: new Date().toISOString(),
      eventType: HistoryEventType.updated,
    })
      return await this.eventModel.findByIdAndUpdate({ _id }, {...changes, history: [...event.history]});
    }

    return null;
  }

  async delete(id: string): Promise<any> {
    let event;
    if (isNaN(+id)) {
      event = await this.eventModel.findById(new mongoose.Types.ObjectId(id))
    } else {
      event = await this.eventModel.findOne({ id: +id });
    }
    if (!event) {
      throw new Error('Event not found');
    }
    return this.eventModel.findByIdAndDelete(event._id);
  }

  // DELETE
  async search(query: string, skip: number, limit: number): Promise<any[]> {
    return await this.eventModel.find({
      $or: [
        { 'name.de': { $regex: query, $options: 'i' } },
        { 'shortDescription.de': { $regex: query, $options: 'i' } },
      ],
    }).skip(skip).limit(limit).exec();
  }
}
