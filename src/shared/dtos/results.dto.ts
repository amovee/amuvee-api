import { ActionDTO, MinActionDTO } from 'src/shared/dtos/actions.dto';
import { LocationDTO } from './locations.dto';
import { Ref } from './ref';
import { CategoryDTO } from './categories.dto';
import { HistoryDTO, RolesDTO } from './roles.dto';
import { NumberRange, StateType, Variables } from './types.dto';
import { RegionDTO } from './region.dto';
import { ApiProperty } from '@nestjs/swagger';
export type ResultTypeDTO = {
  _id?: string;
  id?: number;
  name: {
    [language: string]: string;
  };
  weight: number;
};

export interface UpdateResultTypeDTO {
  name?: {
    [language: string]: string;
  };
  weight?: number;
}

export interface CreateResultTypeDTO {
  name: {
    [language: string]: string;
  };
  weight: number;
}

export class ResultDTO {
  _id?: string;
  id?: number;
  specific?: string;
  name?: string;
  categories: Ref<CategoryDTO>[];
  type?: Ref<ResultTypeDTO>;
  variations?: VariationDTO[];
  roles: RolesDTO;
  history: HistoryDTO[];
  updatedAt: Date;
  createdAt: Date;
}

export class VariationDTO {
  _id: string;
  status?: StateType;
  roles?: RolesDTO;
  history?: HistoryDTO[];
  name?: string;
  timespan?: Timespan;
  amountOfMoney?: NumberRange;
  title: { [language: string]: string };
  shortDescription: { [language: string]: string };
  description: { [language: string]: string };
  actions?: Ref<ActionDTO>[];
  locations?: Ref<LocationDTO>[];
  variables: Variables;
  filters: ResultFilters[];
  updatedAt: Date;
  createdAt: Date;
}

class Timespan {
  from: null | Date;
  to: null | Date;
}

export class ResultFilters {
  rent?: NumberRange;
  income?: NumberRange;
  childrenCount?: NumberRange;
  childrenAge?: NumberRange;
  parentAge?: NumberRange;
  parentGender?: ('FEMALE' | 'MALE' | 'DIVERSE')[];
  regions?: Ref<RegionDTO>[];
  isPregnant?: boolean;
  isVictimOfViolence?: boolean;
  insurances?: string[]; // _id[]
  relationship?: number[];
  jobRelatedSituation?: number[];
  isRefugee?: boolean;
}

// ???
export interface MinResultDTO {
  _id: string;
  vid?: number;
  rid?: number;
  v_id?: string;
  r_id?: string;
  title: { [language: string]: string };
  shortDescription: { [language: string]: string };
  description: { [language: string]: string };
  actions: Ref<MinActionDTO>[];
  locations: Ref<LocationDTO>[];
  filters: ResultFilters[];
  amountOfMoney: NumberRange;
  timespan: { start: Date | null; end: Date | null };
  type: Ref<ResultTypeDTO>;
  categories: Ref<CategoryDTO>[];
  status?: StateType;
  updatedAt: Date;
  createdAt: Date;
}
//CREATE
export class CreateResultDTO {
  specific?: string;
  name: string;
  categories: Ref<CategoryDTO>[];
  type: Ref<ResultTypeDTO>;
  variations: VariationDTO[];
}
export class CreateResultFilters {
  rent?: NumberRange;
  income?: NumberRange;
  childrenCount?: NumberRange;
  childrenAge?: NumberRange;
  parentAge?: NumberRange;
  parentGender?: ('FEMALE' | 'MALE' | 'DIVERSE')[];
  regions?: Ref<RegionDTO>[];
  isPregnant?: boolean;
  isVictimOfViolence?: boolean;
  insurances?: string[]; // _id[]
  relationship?: number[];
  jobRelatedSituation?: number[];
  isRefugee?: boolean;
}
export class CreateVariationDTO {
  status: StateType;
  name: string;
  timespan: Timespan;
  amountOfMoney: NumberRange;
  content: {
    [language: string]: {
      title: string;
      shortDescription: string;
      description: string;
    };
  };
  actions: string[];
  locations: string[];
  variables: Variables;
  filters: CreateResultFilters[];
}
