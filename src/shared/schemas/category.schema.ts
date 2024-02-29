import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { Document } from 'mongoose';
import { Roles } from 'src/shared/schemas/meta.schema'
import { StateType, UserDTO } from '../dtos/types.dto';
export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop()
  _id: mongoose.Schema.Types.ObjectId;
  @Prop()
  id: number;
  @Prop()
  icon: string;
  @Prop()
  status: StateType;
  @Prop()
  sort: number;
  
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
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  name: {[key: string]: string;};
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  shortDescription: {[key: string]: string;};
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  description: {[key: string]: string;};

}

export const CategorySchema = SchemaFactory.createForClass(Category);
