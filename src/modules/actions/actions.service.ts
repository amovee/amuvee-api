import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Action } from 'rxjs/internal/scheduler/Action';
import { ActionDocument } from './action.schema';
import mongoose, { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}
  async migrate(): Promise<void> {
    await this.actionModel.deleteMany().exec();
    const users: User[] = await this.userModel.find().exec();
    const counter = (
      await axios.get(
        process.env.DIRECTUS_URL + 'items/action?fields=*&limit=0&meta=filter_count'
      )
    ).data.meta.filter_count;

    const actions = (
      await axios.get(
        process.env.DIRECTUS_URL +
          'items/action?fields=*,russian.*,ukrainian.*&sort=id&limit=' +
          counter
      )
    ).data.data;
    for (let i = 0; i < actions.length; i++) {
      const a: any = {
        _id: new mongoose.Types.ObjectId(),
        oldId: +actions[i].id,
        status: actions[i].status,
        specific: actions[i].specific,
        sort: actions[i].weight,
        content: {
          de: {
            name: actions[i].name,
            description: actions[i].description,
          },
        },
      };
      const userUpdated: User = users.find(user=>{
        return user.oldId == actions[i].user_updated
      });
      if(userUpdated) {
        a.updated = {
          by: userUpdated._id,
          date: actions[i].date_updated
        }
      }
      const userCreated: User = users.find(user=>{
        return user.oldId == actions[i].user_created
      });
      if(userCreated) {
        a.created = {
          by: userCreated._id,
          date: actions[i].date_created
        }
      }
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
}
