import { HistoryDTO, RolesDTO } from './roles.dto';
import { StateType } from './types.dto';
import { ApiProperty } from '@nestjs/swagger';

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
  history: HistoryDTO[];
}
export class createActionsDTO {
  @ApiProperty()
  readonly id: number;
  @ApiProperty()
  readonly status: StateType;
  @ApiProperty()
  readonly specific: string | null;
  @ApiProperty()
  readonly content: {
    [languageKey: string]: {
      name: string;
      description?: string;
    };
  };
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
