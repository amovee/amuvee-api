import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserActivityDocument } from 'src/shared/schemas/userActivity.schema';
import { UsersService } from './users.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectModel('UserActivity')
    private userActivityModel: Model<UserActivityDocument>,
    private usersService: UsersService,

  ) {
  }

  async updateActivity(userUUId: string, action: string, details: any): Promise<UserActivityDocument> {
    const activity = await this.userActivityModel.findOne({userUUId});
    console.log('inside', activity);
    if (!activity) {
      const newActivity = new this.userActivityModel({
        activityUUId: uuidv4(),
        userUUId: userUUId,
        action: action,
        history: [details],
      });
      this.usersService.addActivityToUser(userUUId, newActivity.activityUUId);
      return newActivity.save();
    } else {
      const detailExists = activity.history.some((item) => {
        return JSON.stringify(item) === JSON.stringify(details);
      });
      if (!detailExists) {
        activity.history.push(details);
        activity.markModified('history');
      }
      return activity.save();
    }
  }
}