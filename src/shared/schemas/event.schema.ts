import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { Document } from 'mongoose';
import { Roles } from 'src/shared/schemas/meta.schema';
import { StateType } from '../dtos/types.dto';
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
  @Prop()
  start: Date;
  @Prop()
  end: Date;
  @Prop({ _id: false, type: Roles })
  roles: Roles;
  @Prop({
    type: mongoose.Schema.Types.Map,
    of: {
      _id: false,
      name: String,
      shortDescription: String,
    },
  })
  content: {
    [key: string]: {
      name: string;
      shortDescription: string;
    };
  };
}

export const EventSchema = SchemaFactory.createForClass(Event);
