import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Action } from './action.schema';
import { Category } from './category.schema';
import { Location } from './location.schema';
import { Region } from './region.schema';
import { Roles } from 'src/shared/schemas/meta.schema';
import { UserDTO } from '../dtos/types.dto';

export type ResultDocument = Result & Document;
export type MinResultDocument = MinResult & Document;

@Schema()
export class ResultType {
  @Prop()
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    type: mongoose.Schema.Types.Map,
    of: String,
  })
  name: {
    [key: string]: string;
  };
  @Prop()
  weight: number;
  @Prop({ unique: true })
  id: number;
}

export type ResultTypeDocument = ResultType & Document;
export const ResultTypeSchema = SchemaFactory.createForClass(ResultType);

@Schema()
export class NumberFilter {
  @Prop()
  min: number;
  @Prop()
  max: number;
}

@Schema()
export class ResultFilters {
  @Prop({ _id: false, type: NumberFilter })
  rent: NumberFilter;
  @Prop({ _id: false, type: NumberFilter })
  income: NumberFilter;
  @Prop({ _id: false, type: NumberFilter })
  childrenCount: NumberFilter;
  @Prop({ _id: false, type: NumberFilter })
  childrenAge: NumberFilter;
  @Prop({ _id: false, type: NumberFilter }) //???
  parentAge: NumberFilter;
  @Prop()
  parentGender: string[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Region' }])
  regions: Region[]; // TODO: generate from zips
  @Prop()
  isPregnant: boolean;
  @Prop()
  isVictimOfViolence: boolean;
  @Prop({ type: [String] })
  insurances: string[];
  @Prop()
  relationships: number[];
  @Prop()
  jobRelatedSituations: number[];
  @Prop()
  isRefugee: boolean;
}

@Schema()
export class Variation {
  @Prop()
  status: string;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
  @Prop()
  name: string;
  @Prop({ type: { from: Date, to: Date, _id: false } })
  timespan: { from: Date; to: Date };
  @Prop([{ type: ResultFilters }])
  filters: ResultFilters[];
  @Prop({ _id: false, type: NumberFilter })
  amountOfMoney: NumberFilter;
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  title: {[key: string]: string;};
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  shortDescription: {[key: string]: string;};
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  description: {[key: string]: string;};
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Action' }] })
  actions: Action[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }])
  locations: Location[];
  @Prop()
  variables: { [key: string]: { [key: string]: string } }[];
}

@Schema()
export class Result {
  @Prop()
  _id: mongoose.Schema.Types.ObjectId;
  @Prop()
  id: number;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
  @Prop({ _id: false, type: Roles })
  roles: Roles;
  @Prop({
    _id: false,
    type: [
      {
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
        date: Date,
        eventType: String,
        value: String,
      },
    ],
  })
  history: [{ by: UserDTO; date: Date; eventType: string; value: string }];
  @Prop()
  specific: string;
  @Prop()
  name: string;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  categories: Category[];
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ResultType' })
  type: ResultType;
  @Prop([{ type: Variation }])
  variations: Variation[];
}
export const ResultSchema = SchemaFactory.createForClass(Result);

@Schema()
export class MinResult {
  @Prop()
  _id: mongoose.Schema.Types.ObjectId;
  @Prop()
  vid: number;
  @Prop()
  rid: number;
  @Prop()
  v_id: mongoose.Schema.Types.ObjectId;
  @Prop()
  r_id: mongoose.Schema.Types.ObjectId;
  
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  title: {[key: string]: string;};
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  shortDescription: {[key: string]: string;};
  @Prop({ type: mongoose.Schema.Types.Map, of: String})
  description: {[key: string]: string;};
  
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Action' }] })
  actions: Action[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }])
  locations: Location[];
  @Prop([{ type: ResultFilters }])
  filters: ResultFilters[];
  @Prop({ _id: false, type: NumberFilter })
  amountOfMoney: NumberFilter;
  @Prop({ type: { from: Date, to: Date, _id: false } })
  timespan: { from: Date; to: Date };
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ResultType' })
  type: ResultType;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  categories: Category[];
  @Prop()
  status: string;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}
export const MinResultSchema = SchemaFactory.createForClass(MinResult);