import { HistoryDTO, RolesDTO } from './roles.dto';
import { StateType } from './types.dto';
import { ApiProperty } from '@nestjs/swagger';

// Gibt es Aktionen, die nur für Geflüchtete sind
export interface ActionDTO {
  _id: string;
  id: number;
  status: StateType,
  specific: string | null;
  name: {[language: string]: string};
  description: {[language: string]: string};
  roles: RolesDTO;
  history: HistoryDTO[];
}
export class CreateActionsDTO {
  @ApiProperty()
  readonly status: StateType;
  @ApiProperty()
  readonly specific: string | null;
  @ApiProperty()
  readonly name: {[language: string]: string};
  @ApiProperty()
  readonly description: {[language: string]: string};
}

export interface MinActionDTO {
  _id: string;
  id: number;
  status: StateType,
  name: {[language: string]: string};
  description: {[language: string]: string};
}
