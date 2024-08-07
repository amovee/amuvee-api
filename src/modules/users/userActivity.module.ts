import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {UserActivity, UserActivitySchema} from "../../shared/schemas/userActivity.schema";
import { UserActivityService } from './userActivity.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'UserActivity', schema: UserActivitySchema }]),
  ],
  providers: [UserActivityService],
  exports: [UserActivityService]
})
export class UserActivityModule {}