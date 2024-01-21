import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Action } from 'rxjs/internal/scheduler/Action';
import mongoose, { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { CounterService } from '../counters/counters.service';
import { ActionDocument } from 'src/shared/schemas/action.schema';
import { mappingStateType } from 'src/shared/dtos/types.dto';
import { ActionDTO } from 'src/shared/dtos/actions.dto';
import { Result, ResultDocument } from 'src/shared/schemas/result.schema';
import { ResultDTO } from 'src/shared/dtos/results.dto';
import { HistoryEventType } from 'src/shared/dtos/roles.dto';

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly counter: CounterService,
  ) {}
  async migrate(): Promise<void> {
    await this.counter.deleteSequenzDocument('actions');
    await this.actionModel.deleteMany().exec();
    const users: User[] = await this.userModel.find().exec();
    const counter = (
      await axios.get(
        process.env.DIRECTUS_URL +
          'items/action?fields=*&limit=0&meta=filter_count',
      )
    ).data.meta.filter_count;

    const actions = (
      await axios.get(
        process.env.DIRECTUS_URL +
          'items/action?fields=*,russian.*,ukrainian.*&sort=id&limit=' +
          counter,
      )
    ).data.data;
    
    const admin = await this.userModel.findOne({ name: 'admin' }).exec();
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const a: any = {
        _id: new mongoose.Types.ObjectId(),
        id: await this.counter.setMaxSequenceValue('actions', +action.id),
        status: mappingStateType(action.status),
        specific: action.specific,
        sort: action.weight,
        roles: {
          author: undefined,
          reviewer: undefined,
        },
        history: [],
        content: {
          de: {
            name: action.name,
            description: action.description,
          },
        },
      };
      if (action.russian != null) {
        a.content['ru'] = {
          name: action.russian.name,
          description: action.russian.description,
        };
      }
      if (action.ukrainian != null) {
        a.content['uk'] = {
          name: action.ukrainian.name,
          description: action.ukrainian.description,
        };
      }
      if (action.user_created) {
        let userCreated = await this.userModel.findOne({ oldId: action.user_created }).exec();
        if (!userCreated) {
          userCreated = admin;
        }
        a.roles.author = userCreated._id;
        a.history.push({
          by: userCreated._id,
          date: action.date_created,
          eventType: HistoryEventType.created,
        });
      }
      if (action.user_updated) {
        const userUpdated = await this.userModel.findOne({ oldId: action.user_updated }).exec();
        if (userUpdated) {
          a.roles.author = userUpdated._id;
          a.history.push({
            by: userUpdated._id,
            date: action.date_updated,
            eventType: HistoryEventType.updated,
            value: 'Last update by Directus UI',
          });
        }
      }
      a.history.push({
        by: admin._id,
        date: new Date().toISOString(),
        eventType: HistoryEventType.migrated,
        value: 'Migrated from Directus',
      });
      new this.actionModel(a).save();
    }
    return;
  }
  async getMentions(id: number, limit: number, skip: number) {
    const action = await this.actionModel.findOne<ActionDTO>({ id });
    if (action != null) {
      const results = await this.resultModel.find<ResultDTO>({
        variations: {
          $elemMatch: {
            actions: action._id,
          },
        },
      }).skip(skip).limit(limit);
      return results.map((r) => ({ name: r.name, id: r.id }));
    }
    return [];
  }
}
