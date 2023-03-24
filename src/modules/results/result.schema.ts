import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserDTO } from 'src/types/types.dto';
import { Action } from '../actions/action.schema';
import { Category } from '../categories/category.schema';
import { Location } from '../locations/location.schema';
import { Region } from '../../schemas/region.schema';

export type ResultDocument = Result & Document;
export type FilterDocument = Filter & Document;

@Schema()
export class Filter {
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({ type: { min: Number, max: Number } }) // DONE
  rent: { min: number; max: number };
  @Prop({ type: { min: Number, max: Number } }) // DONE
  income: { min: number; max: number };
  @Prop({ type: { min: Number, max: Number } }) // DONE
  childrenCount: { min: number; max: number };
  @Prop({ type: { min: Number, max: Number } }) // DONE
  childrenAge: { min: number; max: number };

  @Prop({ type: { min: Number, max: Number } }) //???
  parentAge: { min: number; max: number };

  @Prop() // DONE
  parentGender: number[];

  @Prop({ type: [String] })
  zips: string[]; 
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Region' }])
  regions: Region[];
  @Prop({ type: [String] }) // DONE
  requiredKeys: string[];
  @Prop({ type: [String] })
  insurances: string[]; 
  @Prop()
  relationships: number[]; 
  @Prop()
  jobRelatedSituations: number[]; 
  @Prop({
    _id : false,
    type: {
      by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Users'
      },
      date: Date
    }
  })
  created: {
    by: UserDTO,
    date: Date
  }
  @Prop({
    _id : false,
    type: {
      by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Users'
      },
      date: Date
    }
  })
  updated: {
    by: UserDTO,
    date: Date
  }
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.Map,
        of: {
          type: mongoose.Schema.Types.Map,
          of: String,
        },
      },
    ],
  })
  variables: { [key: string]: { [key: string]: string } }[];
}
export const FilterSchema = SchemaFactory.createForClass(Filter);


@Schema()
export class Result {
  @Prop()
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({ type: { from: Date, to: Date, _id: false } })
  timespan: { from: Date; to: Date };
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  categories: Category[];
  @Prop()
  type: number;

  @Prop({ type: { min: Number, max: Number, _id: false } })
  amountOfMoney: { min: number; max: number };
  @Prop({
    type: mongoose.Schema.Types.Map,
    of: {
      _id: false,
      name: String,
      description: String,
      shortDescription: String,
    },
  })
  content: {
    [key: string]: {
      description: string;
      shortDescription: string;
      name: string;
    };
  };

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Filter' }])
  filters: Filter[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Action' }] })
  actions: Action[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }])
  locations: Location[];
  // META
  @Prop()
  id: number;
  @Prop()
  status: string;
  @Prop()
  sort: number; // weight
  @Prop({
    _id : false,
    type: {
      by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Users'
      },
      date: Date
    }
  })
  created: {
    by: UserDTO,
    date: Date
  }
  @Prop({
    _id : false,
    type: {
      by: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Users'
      },
      date: Date
    }
  })
  updated: {
    by: UserDTO,
    date: Date, _id: false
  }
}
export const ResultSchema = SchemaFactory.createForClass(Result);
