import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Roles } from 'src/shared/schemas/meta.schema';
import { StateType, UserDTO } from '../dtos/types.dto';
export type ActionDocument = Action & Document;
export type ActionTypeDocument = Action & Document;
@Schema({collection: 'actions'})
export class Action {
  _id: mongoose.Schema.Types.ObjectId;
  @Prop()
  id: number;
  @Prop()
  specific: string;
  @Prop()
  status: StateType;
  @Prop()
  sort: number;
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  name: {[key: string]: string;};
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  description: {[key: string]: string;};
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

export const ActionSchema = SchemaFactory.createForClass(Action);
