import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Roles } from 'src/shared/schemas/meta.schema';
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
  id: number;
  @Prop()
  status: string;
  @Prop({ _id: false, type: Roles })
  roles: Roles;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
