import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class UserActivity {
  @Prop({ default: uuidv4, unique: true, index: true })
  activityUUId: string;

  @Prop({ type: String, ref: 'User', required: true })
  userUUId: string;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: [{ type: mongoose.Schema.Types.Mixed }] })
  history: any[];
}

export type UserActivityDocument = UserActivity & Document;
export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
