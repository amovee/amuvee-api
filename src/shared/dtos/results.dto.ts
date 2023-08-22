import { ActionDTO, MinActionDTO } from 'src/shared/dtos/actions.dto';
import { LocationDTO } from './locations.dto';
import { Ref } from './ref';
import { CategoryDTO } from './categories.dto';
import { RolesDTO } from './roles.dto';
import { NumberRange, StateType, Variables } from './types.dto';
import { Region } from '../schemas/region.schema';

export type ResultTypeDTO = {
  _id?: string;
  name: {
    [language: string]: string
  };
  weight: number;
};

export interface ResultDTO {
  _id?: string;
  id?: number;
  status?: StateType;
  specific?: string;
  roles?: RolesDTO;
  name?: string;
  categories: Ref<CategoryDTO>[];
  type?: Ref<ResultTypeDTO>;
  variations?: VariationDTO[];
}

export interface VariationDTO {
  name?: string;
  timespan?: Timespan;
  amountOfMoney?: NumberRange;
  content?: {
    [language: string]: {
      title: string;
      shortDescription: string;
      description: string;
    };
  };
  actions?: Ref<ActionDTO>[];
  locations?: Ref<LocationDTO>[];
  variables: Variables;
  filters: ResultFilters;
}

interface Timespan {
  from: null | Date;
  to: null | Date;
}

export interface ResultFilters {
  rent?: NumberRange;
  income?: NumberRange;
  childrenCount?: NumberRange;
  childrenAge?: NumberRange;
  parentAge?: NumberRange;
  parentGender?: ('FEMALE' | 'MALE' | 'DIVERSE')[];
  regions?: Ref<Region>[];
  hasKeys?: ('pregnant' | 'victimsOfViolence')[];
  insurances?: string[]; // _id[]
  relationship?: number[];
  jobRelatedSituation?: number[];
}

// ???
export interface MinResultDTO {
  _id: string;
  v_id: string;
  id: number;
  language: string;
  content?: {
    [language: string]: {
      title: string;
      shortDescription: string;
      description: string;
    };
  };
  actions: Ref<MinActionDTO>[];
  locations: Ref<LocationDTO>[];
  amountOfMoney: NumberRange;
  timespan: { start: Date | null; end: Date | null };
  type: Ref<ResultTypeDTO>;
}
// ???
export interface ResultTableRowDTO {
  _id: string;
  id: number;
  name: string;
  timespan: { start: Date | null; end: Date | null };
  type: Ref<ResultTypeDTO>;
  roles?: RolesDTO;
}