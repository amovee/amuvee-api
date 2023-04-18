import { ActionDTO, MinActionDTO } from 'src/shared/dtos/actions.dto';
import { RolesDTO } from 'src/types/roles.dto';
import { numberFilter, Region, Variables } from 'src/types/types.dto';
import { LocationDTO } from './locations.dto';

export type ResultType = {
  name: {
    [language: string]: string
  };
  weight: number;
};

export interface ResultDTO {
  _id?: string;
  id?: number;
  status?: string;
  specific?: string;
  roles?: RolesDTO;

  name?: string;
  categories: string[];
  type?: string;

  variations?: VariationDTO[];
}

export interface VariationDTO {
  name?: string;
  timespan?: { start: Date | null; end: Date | null };
  rent?: numberFilter;
  income?: numberFilter;
  childrenCount?: numberFilter;
  childrenAge?: numberFilter;
  parentAge?: numberFilter;
  parentGender?: ('FEMALE' | 'MALE' | 'DIVERSE')[];
  regions?: Region[];
  hasKeys?: ('pregnant' | 'victimsOfViolence')[];
  insurances?: string[];
  relationship?: number[];
  jobRelatedSituation?: number[];
  amountOfMoney?: numberFilter;
  content?: {
    [language: string]: {
      title: string;
      shortDescription: string;
      description: string;
    };
  };
  actions?: ActionDTO[];
  locations?: LocationDTO[];
  variables: Variables;
}

export interface MinResultDTO {
  _id: string;
  id: number;
  language: string;
  content?: {
    [language: string]: {
      title: string;
      shortDescription: string;
      description: string;
    };
  };
  actions: MinActionDTO[];
  locations: LocationDTO[];
  amountOfMoney: numberFilter;
  timespan: { start: Date | null; end: Date | null };
  type: ResultType;
}
