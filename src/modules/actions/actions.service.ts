import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Action } from 'rxjs/internal/scheduler/Action';
import mongoose, { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { CounterService } from '../counters/counters.service';
import { ActionDocument } from 'src/shared/schemas/action.schema';
import { mappingStateType } from 'src/shared/dtos/types.dto';
import { ActionDTO, CreateActionsDTO } from 'src/shared/dtos/actions.dto';
import { Result, ResultDocument } from 'src/shared/schemas/result.schema';
import { ResultDTO } from 'src/shared/dtos/results.dto';
import { HistoryEventType } from 'src/shared/dtos/roles.dto';
import { ResultsService } from 'src/modules/results/results.service';

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly counter: CounterService,
    private readonly resultsService: ResultsService,
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
        name: { de: action.name },
        description: { de: action.description },
      };
      if (action.russian != null) {
        a.name['ru'] = action.russian.name;
        a.description['ru'] = action.russian.description;
      }
      if (action.ukrainian != null) {
        a.name['uk'] = action.ukrainian.name;
        a.description['uk'] = action.ukrainian.description;
      }
      if (action.user_created) {
        let userCreated = await this.userModel
          .findOne({ oldId: action.user_created })
          .exec();
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
        const userUpdated = await this.userModel
          .findOne({ oldId: action.user_updated })
          .exec();
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
  async getMentions(id: string, limit: number, skip: number) {
    const action = await this.actionModel.findById<ActionDTO>(id);
    if (action != null) {
      const results = await this.resultModel
        .find<ResultDTO>({
          variations: {
            $elemMatch: {
              actions: action._id,
            },
          },
        })
        .skip(skip)
        .limit(limit);
      return results.map((r) => ({ name: r.name, id: r.id, _id: r._id }));
    }
    return [];
  }
  async getMentionsCounter(id: string): Promise<{ totalCount: number }> {
    const action = await this.actionModel.findById<ActionDTO>(id);
    if (action != null) {
      return {
        totalCount: await this.resultModel.countDocuments({
          variations: {
            $elemMatch: {
              actions: action._id,
            },
          },
        }),
      };
    }
    return { totalCount: 0 };
  }

  async getAll(limit: number, skip: number, search?: string) {
    let query: any = {};
    if (search) {
      query = {
        $or: [
          { 'name.de': { $regex: search, $options: 'i' } },
          { 'name.uk': { $regex: search, $options: 'i' } },
          { 'name.ru': { $regex: search, $options: 'i' } },
          { 'description.de': { $regex: search, $options: 'i' } },
          { 'description.uk': { $regex: search, $options: 'i' } },
          { 'description.ru': { $regex: search, $options: 'i' } },
        ],
      };
    }

    const actions = await this.actionModel.find(query).skip(skip).limit(limit);
    return actions;
  }
  async deleteAction(id: string) {
    const action = await this.getAction(id);
    if (action != null) {
      const action = await this.actionModel.findByIdAndDelete(id);
      const resultsToUpdate = await this.resultModel.find({
        'variations.actions': action._id,
      });
      resultsToUpdate.map(async (r) => {
        r.variations.map((v) => {
          v.actions = v.actions.filter((a) => a != action._id);
        });
        await r.save();
      });
      resultsToUpdate.map(async (r) => {
        await this.resultsService.updateMinResult(r._id);
      });
      return `Action with id ${action.id} deleted`;
    }
    throw new HttpException('Action not found', HttpStatus.NOT_FOUND);
  }
  async getAction(id: string): Promise<ActionDTO | undefined> {
    return await this.actionModel.findById(id);
  }

  async update(_id: string, changes: CreateActionsDTO, userId: string) {
    const action = await this.getAction(_id);
    if (action) {
      action.history.push({
        by: userId,
        date: new Date().toISOString(),
        eventType: HistoryEventType.updated,
      });
      const updatedAction = await this.actionModel.findByIdAndUpdate(
        { _id },
        { ...changes },
        { new: true },
      );
      const resultsToUpdate = await this.resultModel.find({
        'variations.actions': updatedAction._id,
      });
      resultsToUpdate.map(async (r) => {
        await this.resultsService.updateMinResult(r._id);
      });
      return updatedAction;
    }
    throw new HttpException('Action not found', HttpStatus.NOT_FOUND);
  }
  async create(action: CreateActionsDTO, userId: string) {
    const id = await this.counter.getNextSequenceValue('actions');
    const roles = { roles: { author: userId } };
    const history = {
      by: userId,
      date: new Date().toISOString(),
      eventType: HistoryEventType.created,
    };
    const newAction = new this.actionModel({
      ...action,
      ...roles,
      id,
      history,
    });
    newAction._id = new mongoose.Types.ObjectId();
    await newAction.save();
    return newAction;
  }
  async getCount(): Promise<{ totalCount: number }> {
    const totalCount = await this.actionModel.countDocuments();
    return { totalCount };
  }

  async search(query: string, skip: number, limit: number) {
    return this.actionModel
      .find({
        $or: [
          { 'name.de': { $regex: query, $options: 'i' } },
          { 'shortDescription.de': { $regex: query, $options: 'i' } },
          { 'name.ru': { $regex: query, $options: 'i' } },
          { 'shortDescription.ru': { $regex: query, $options: 'i' } },
          { 'name.uk': { $regex: query, $options: 'i' } },
          { 'shortDescription.uk': { $regex: query, $options: 'i' } },
        ],
      })
      .skip(skip)
      .limit(limit)
      .exec();
  }
}
