import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Action } from 'rxjs/internal/scheduler/Action';
import mongoose, { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { CounterService } from '../counters/counters.service';
import { ActionDocument } from 'src/shared/schemas/action.schema';
import { mappingStateType } from 'src/shared/dtos/types.dto';
import { migrateRoles } from 'src/shared/dtos/roles.dto';
import { ActionDTO } from 'src/shared/dtos/actions.dto';
import { Result, ResultDocument } from 'src/shared/schemas/result.schema';
import { ResultDTO } from 'src/shared/dtos/results.dto';

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
    for (let i = 0; i < actions.length; i++) {
      const a: any = {
        _id: new mongoose.Types.ObjectId(),
        id: await this.counter.setMaxSequenceValue('actions', +actions[i].id),
        status: mappingStateType(actions[i].status),
        specific: actions[i].specific,
        sort: actions[i].weight,
        roles: migrateRoles(actions[i], users),
        content: {
          de: {
            name: actions[i].name,
            description: actions[i].description,
          },
        },
      };
      if (actions[i].russian != null) {
        a.content['ru'] = {
          name: actions[i].russian.name,
          description: actions[i].russian.description,
        };
      }
      if (actions[i].ukrainian != null) {
        a.content['uk'] = {
          name: actions[i].ukrainian.name,
          description: actions[i].ukrainian.description,
        };
      }
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
