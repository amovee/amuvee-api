import { ObjectStatus, StateType } from 'src/types/types.dto';
import { Roles } from '../schemas/meta.schema';

// Gibt es Kategorien, die nur für Geflüchtete sind
export interface CategoryDTO {
  _id: string;
  id: number;
  status: StateType;
  icon: string;
  sort: number;
  content?: {
    [language: string]: {
      name: string;
      description: string;
      shortDescription: string;
    };
  };
  roles: Roles;
}
export interface MinCategoryDTO {
  _id: string;
  icon: string;
  content?: {
    [language: string]: {
      name: string;
      description: string;
      shortDescription: string;
    };
  };
}
