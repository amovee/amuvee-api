import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Roles } from 'src/shared/schemas/meta.schema';
import { UserDTO } from '../dtos/types.dto';
export type LocationDocument = Location & Document;
@Schema()
export class Location {
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    type: { street: String, houseNr: String, zip: String, place: String },
    _id: false
  })
  address: { street: string; houseNr: string; zip: string; place: string };
  @Prop()
  link: string;
  @Prop()
  name: string;
  @Prop()
  id: number;
  @Prop()
  status: string;
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

export const LocationSchema = SchemaFactory.createForClass(Location);
