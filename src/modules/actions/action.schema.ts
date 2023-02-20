import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { StateType, UserDTO } from 'src/types/types.dto';
export type ActionDocument = Action & Document;
export type ActionTypeDocument = Action & Document;
@Schema()
export class Action {
  _id: mongoose.Schema.Types.ObjectId;
  @Prop()
  oldId: number;
  @Prop()
  specific: string;
  @Prop()
  status: StateType;
  @Prop()
  sort: number;
  @Prop({
    _id : false,
    type: {
      by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Users'
      },
      date: Date
    }
  })
  created: {
    by: UserDTO,
    date: Date
  }
  @Prop({
    _id : false,
    type: {
      by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Users'
      },
      date: Date
    }
  })
  updated: {
    by: UserDTO,
    date: Date
  }
  @Prop({
    type: mongoose.Schema.Types.Map,
    of: { _id: false, name: String, description: String },
  })
  content: {
    [key: string]: {
      description: string;
      name: string;
    };
  };
}

export const ActionSchema = SchemaFactory.createForClass(Action);
