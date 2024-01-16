import { right } from './rights';
import { ApiProperty } from '@nestjs/swagger';

export const State = {
  archived: 'ARCHIVED',
  standby: 'STANDBY',
  draft: 'DRAFT',
  toReview: 'TO_REVIEW',
  reviewed: 'REVIEWED',
  published: 'PUBLISHED',
  toTranslate: 'TO_TRANSLATE',
} as const;
export type StateType = typeof State[keyof typeof State];
export const mappingStateType = (status: string): StateType => {
  switch (status) {
    case 'published': return State.published;
    case 'draft': return State.draft;
    case 'archived': return State.archived;
    case 'reviewed': return State.reviewed;
    case 'in progress': return State.draft;
    case 'ready for review': return State.toReview;
    case 'todo': return State.draft;
    case 'ready for translation': return State.toTranslate;
  }
  return State.standby;
}


export const Gender = {
  female: 'FEMALE',
  male: 'MALE',
  diverse: 'DIVERSE',
} as const;
export type GenderType = typeof Gender[keyof typeof Gender];

export interface ObjectStatus {
  id: number;
  status: StateType;
  created?: { by: UserDTO; date: Date };
  updated?: { by: UserDTO; date: Date };
}

export interface AuthorInformation {
  name: string;
  specific: string | null;
}

export interface UserDTO {
  _id: string;
  oldId: string;
  name: string;
  email: string;
  rights: right[];
  isAdmin: boolean;
}

export interface IdNameTupel {
  id: number;
  name: string;
}
export type Variables = { [variableName: string]: { [language: string]: string } }[]
export type NumberRange = {
  min?: number;
  max?: number;
}

export class LoginDTO {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password of the user',
  })
  password: string;
}
export class CreateResultTypeDTOAPI {
  @ApiProperty({
    example: {
      "de": "example",
      "uk": "example",
      "ru": "example",
    },
    description: 'Name of the result type',
  })
  name: {
    [language: string]: string
  };

  @ApiProperty({
    example: 1,
    description: 'Weight of the result type',
  })
  weight: number;
}
