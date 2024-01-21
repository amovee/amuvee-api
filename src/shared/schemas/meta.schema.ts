import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UserDTO } from '../dtos/types.dto';
export type MetaDocument = Meta & Document;
@Schema()
export class Meta {
  @Prop()
  id: number;
  @Prop()
  name: string;
  @Prop()
  status: string;
  @Prop()
  sort: number; // weight
}

export const MetaSchema = SchemaFactory.createForClass(Meta);

@Schema()
export class Roles {
  @Prop({
    _id: false, 
    type: mongoose.Schema.Types.ObjectId, ref: 'Users'
  })
  author: UserDTO;
  @Prop({
    _id: false, 
    type: mongoose.Schema.Types.ObjectId, ref: 'Users'
  })
  reviewer: UserDTO;
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

@Schema()
export class NewRoles {
  @Prop({
    _id: false, 
    type: mongoose.Schema.Types.ObjectId, ref: 'Users'
  })
  author: UserDTO;
  @Prop({
    _id: false, 
    type: mongoose.Schema.Types.ObjectId, ref: 'Users'
  })
  reviewer: UserDTO;
}