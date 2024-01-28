import { ApiProperty } from '@nestjs/swagger';
import { HistoryDTO, RolesDTO } from './roles.dto';
import { State, StateType } from './types.dto';

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
export class CreateCategoryDTO {
  @ApiProperty({
    enum: Object.values(State),
  })
  status: StateType;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  sort: number;
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        shortDescription: { type: 'string' },
      },
    },
  })
  content?: {
    [language: string]: {
      name: string;
      description: string;
      shortDescription: string;
    };
  };
}
export class UpdateCategoryDTO {
  @ApiProperty({
    enum: Object.values(State),
  })
  status: StateType;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  sort: number;
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        shortDescription: { type: 'string' },
      },
    },
  })
  content?: {
    [language: string]: {
      name: string;
      description: string;
      shortDescription: string;
    };
  };
}