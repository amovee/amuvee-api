import { RolesDTO } from './roles.dto';
import { StateType } from './types.dto';

// Gibt es Aktionen, die nur für Geflüchtete sind
export interface ActionDTO {
  _id: string;
  id: number;
  status: StateType,
  specific: string | null;
  content: {
    [languageKey: string]: {
      name: string;
      description?: string;
    };
  };
  roles: RolesDTO;
}

export interface MinActionDTO {
  _id: string;
  content: {
    [languageKey: string]: {
      name: string;
      description: string;
    };
  };
}
