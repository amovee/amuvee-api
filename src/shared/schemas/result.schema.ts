import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Action } from './action.schema';
import { Category } from './category.schema';
import { Location } from './location.schema';
import { Region } from './region.schema';
import { Roles } from 'src/shared/schemas/meta.schema';

export type ResultDocument = Result & Document;

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
  weight: number
}

export type ResultTypeDocument = ResultType & Document;
export const ResultTypeSchema = SchemaFactory.createForClass(ResultType);

@Schema()
export class NumberFilter {
  @Prop()
  min: number;
  @Prop()
  max: number
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
  @Prop({ _id: false, type: Roles })
  roles: Roles;
  @Prop()
  name: string;
  @Prop({ type: { from: Date, to: Date, _id: false } })
  timespan: { from: Date; to: Date };
  @Prop([{ type: ResultFilters }])
  filters: ResultFilters[];
  @Prop({ _id: false, type: NumberFilter })
  amountOfMoney: NumberFilter;
  @Prop({
    type: mongoose.Schema.Types.Map,
    of: {
      _id: false,
      title: String,
      description: String,
      shortDescription: String,
    },
  })
  content: {
    [key: string]: {
      title: string;
      shortDescription: string;
      description: string;
    };
  };
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
  @Prop({ _id: false, type: Roles })
  roles: Roles;
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