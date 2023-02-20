import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
export type LocationDocument = Location & Document;
@Schema()
export class Location {
  @Prop({type: {street: String, houseNr: String, zip: String, place: String}})
  address: {street: string, houseNr: string, zip: string, place: string};
  @Prop()
  description: string;
  @Prop()
  googleMapsLink: string;

  @Prop()
  name: string;
  @Prop()
  oldId: number;
  @Prop()
  status: string;
  @Prop()
  sort: number; // weight
  @Prop()
  userCreated: string;
  @Prop()
  dateCreated: Date;
  @Prop()
  userUpdated: string;
  @Prop()
  dateUpdated: Date;
}

export const LocationSchema = SchemaFactory.createForClass(Location);