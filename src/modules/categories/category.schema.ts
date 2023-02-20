import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { Document } from 'mongoose';
import { StateType, UserDTO } from 'src/types/types.dto';
export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop()
  _id: mongoose.Schema.Types.ObjectId;
  @Prop()
  oldId: number;
  @Prop()
  icon: string;
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
    of: {
      _id: false,
      name: String,
      description: String,
      shortDescription: String,
    },
  })
  content: {
    [key: string]: {
      description: string;
      shortDescription: string;
      name: string;
    };
  };
}

export const CategorySchema = SchemaFactory.createForClass(Category);
