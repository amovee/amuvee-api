import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserDTO } from 'src/types/types.dto';
export type LocationDocument = Location & Document;
@Schema()
export class Location {
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    type: { street: String, houseNr: String, zip: String, place: String },
  })
  address: { street: string; houseNr: string; zip: string; place: string };
  @Prop()
  link: string;
  @Prop()
  name: string;
  @Prop()
  oldId: number;
  @Prop()
  status: string;
  @Prop()
  sort: number; // weight
  @Prop({
    _id: false,
    type: {
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
      },
      date: Date,
    },
  })
  created: {
    by: UserDTO;
    date: Date;
  };
  @Prop({
    _id: false,
    type: {
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
      },
      date: Date,
    },
  })
  updated: {
    by: UserDTO;
    date: Date;
  };
}

export const LocationSchema = SchemaFactory.createForClass(Location);
