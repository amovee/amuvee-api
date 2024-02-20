import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { Document } from 'mongoose';
import { Roles } from 'src/shared/schemas/meta.schema';
import { StateType, UserDTO } from '../dtos/types.dto';
export type EventDocument = Event & Document;

@Schema()
export class Event {
  @Prop()
  _id: mongoose.Schema.Types.ObjectId;
  @Prop()
  id: number;
  @Prop()
  status: StateType;
  @Prop()
  link: string;
  @Prop()
  style: string;
  @Prop()
  type: string;
  @Prop()
  image: string;
  @Prop({ type: { from: Date, to: Date, _id: false } })
  timespan: { from: Date; to: Date };
  @Prop({
    type: mongoose.Schema.Types.Map,
    of: String
  })
  name: {[key: string]: string}
  @Prop({
    type: mongoose.Schema.Types.Map,
    of: String
  })
  shortDescription: {[key: string]: string}

  @Prop({ _id: false, type: Roles })
  roles: Roles;
  @Prop({
    _id: false, 
    type: [{
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      date: Date,
      eventType: String,
      value: String
    }],
  })
  history: [{ by: UserDTO; date: Date, eventType: string, value: string }];
}

export const EventSchema = SchemaFactory.createForClass(Event);
