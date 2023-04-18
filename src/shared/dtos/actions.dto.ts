import { RolesDTO } from 'src/types/roles.dto';
import { StateType } from 'src/types/types.dto';

// Gibt es Aktionen, die nur für Geflüchtete sind
export interface ActionDTO {
  _id: string;
  status: StateType,
  specific: string | null;
  content: {
    [languageKey: string]: {
      name: string;
      description: string;
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
