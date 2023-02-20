import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type InsuranceDocument = Insurance & Document;
@Schema()
export class Insurance {
  @Prop()
  name: string;
  @Prop()
  isPublic: string;
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

export const InsuranceSchema = SchemaFactory.createForClass(Insurance);
