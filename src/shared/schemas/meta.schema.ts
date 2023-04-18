import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UserDTO } from 'src/types/types.dto';
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
    type: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      date: Date,
    },
  })
  author: { by: UserDTO; date: Date };
  @Prop({
    _id: false, 
    type: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      date: Date,
    },
  })
  reviewer: { by: UserDTO; date: Date };
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