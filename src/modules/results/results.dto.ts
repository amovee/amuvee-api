import {
  AuthorInformation,
  GenderType,
  IdNameTupel,
  numberFilter,
  ObjectStatus,
  Region,
  Variable,
} from 'src/types/types.dto';
import { createActionDTO, getFormattedActionDTO } from '../actions/actions.dto';
import { createCategoryDTO } from '../categories/categories.dto';
import {
  getFormattedLocationDTO,
  LocationDTO,
} from '../locations/locations.dto';

export type ResultType = {
  name: string;
  weight: number;
};

export interface getFormattedResultDTO {
  _id: string;
  id: number;
  content: {
    [language: string]: {
      name: string;
      shortDescription: string;
      description: string;
    };
  };
  locations?: getFormattedLocationDTO[];
  amountOfMoney: numberFilter;
  categories: string[];
  period: { start: Date; end: Date };
  actions?: getFormattedActionDTO[];
  filters?: Filter[];
  type: { weight: number; name: { [language: string]: string } };
}
// Gibt es Resultate, die nur für Geflüchtete sind
export interface ResultDTO extends ObjectStatus, AuthorInformation {
  period: { start: Date; end: Date };
  categories: createCategoryDTO[];
  locations?: LocationDTO[];
  amountOfMoney: numberFilter;
  type: ResultType;
  actions?: createActionDTO[];
  content: {
    [languageKey: string]: {
      name: string;
      description: string;
      shortDescription: string;
    };
  };
}

export interface Filter {
  id: number;
  rent: numberFilter;

  zips: string[];
  regions: Region[];
  income: numberFilter;

  genderParent?: GenderType[];
  ageParent: numberFilter;
  forPregnant?: boolean;
  forVictimsOfViolence?: boolean;

  numberOfChildren: numberFilter;
  ageChildren: numberFilter;

  hasInsurance: IdNameTupel[];
  hasJobRelatedSituation: IdNameTupel[];
  hasRelationship: IdNameTupel[];

  variables: Variable[];
}
