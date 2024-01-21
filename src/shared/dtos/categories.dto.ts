import { HistoryDTO, RolesDTO } from './roles.dto';
import { StateType } from './types.dto';

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
  roles: RolesDTO;
  history: HistoryDTO[];
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
