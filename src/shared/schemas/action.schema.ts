import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Roles } from 'src/shared/schemas/meta.schema';
import { StateType } from '../dtos/types.dto';
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
  @Prop({ _id: false, type: Roles })
  roles: Roles;
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
