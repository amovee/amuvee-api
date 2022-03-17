import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResultDocument = Result & Document;

@Schema()
export class ResultFilter {
  @Prop({ type: {min: Number, max: Number}})
  rent: {min: number, max: number};
  @Prop({ type: {min: Number, max: Number}})
  income: {min: number, max: number};
  @Prop({ type: {min: Number, max: Number}})
  childrenCount: {min: number, max: number};
  @Prop({ type: {min: Number, max: Number}})
  childrenAge: {min: number, max: number};
  // @Prop()
  // motherAge: {min: number, max: number};
    
  @Prop({type: [String]}) // postalcodes || zip
  zips: string[]; //relation
  @Prop({type: [String]})
  regions: string[]; //region
  @Prop()
  requiredKeywords: string[]; // victimOfViolence, pregnant
  @Prop()
  unrequiredKeywords: string[]; // victimOfViolence, pregnant
  @Prop({type: [String]})
  insurances: string[]; //relation
  
  @Prop({type: [String]})
  relationships: string[]; //relation
  
  @Prop({type: [String]})
  jobSituations: string[]; //relation
}
export const ResultFilterSchema = SchemaFactory.createForClass(ResultFilter);
@Schema()
export class Result {
  @Prop()
  startDate: Date;
  @Prop()
  endDate: Date;
  @Prop()
  description: string;
  @Prop()
  shortDescription: string;
  @Prop()
  categoryId: string; //relation
  @Prop()
  typeId: string; //relation
  @Prop({ type: {min: Number, max: Number}})
  amountOfMoney: {min: number, max: number};
  @Prop({ type: ResultFilterSchema })
  filter: ResultFilter;
  
  // META
  @Prop()
  name: string;
  @Prop()
  oldId: string;
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
export const ResultSchema = SchemaFactory.createForClass(Result);