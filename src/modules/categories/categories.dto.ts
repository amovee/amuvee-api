import { ObjectStatus } from 'src/types/types.dto';

// Gibt es Kategorien, die nur für Geflüchtete sind
export interface createCategoryDTO extends ObjectStatus {
  _id: string;
  icon: string;
  sort: number;
  content?: {
    [language: string]: {
      name: string;
      description: string;
      shortDescription: string;
    };
  };
}