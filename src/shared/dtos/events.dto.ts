import { ApiProperty } from '@nestjs/swagger';
import { HistoryDTO, RolesDTO } from './roles.dto';
import { State, StateType } from './types.dto';

export interface EventDTO {
  _id: string;
  id: number;
  status: StateType;
  link: string;
  style: string;
  type: string;
  image: string;
  timespan: { from: Date | null; to: Date | null };
  content?: {
    [language: string]: {
      name: string;
      shortDescription: string;
    };
  };
  roles: RolesDTO;
  history: HistoryDTO[];
}
export class Timespan {
  @ApiProperty({ required: false, type: Date })
  from: Date | null;
  @ApiProperty({ required: false, type: Date })
  to: Date| null;
}
export class CreateEventDTO {
  @ApiProperty({
    enum: Object.values(State),
  })
  status: StateType;
  @ApiProperty()
  link: string;
  @ApiProperty()
  style: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  image: string;
  @ApiProperty({
    type: () => Timespan,
  })
  timespan?: Timespan;
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        shortDescription: { type: 'string' },
      },
    },
  })
  content: {
    [language: string]: {
      name: string;
      shortDescription: string;
    };
  };
}
export class UpdateEventDTO {
  @ApiProperty({
    enum: Object.values(State),
  })
  status: StateType;
  @ApiProperty()
  link: string;
  @ApiProperty()
  style: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  image: string;
  @ApiProperty({
    type: () => Timespan,
  })
  timespan?: Timespan;
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        shortDescription: { type: 'string' },
      },
    },
  })
  content: {
    [language: string]: {
      name: string;
      shortDescription: string;
    };
  };
}