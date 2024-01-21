import { User } from 'src/shared/schemas/user.schema';
import { UserDTO } from './types.dto';
import { Ref } from 'src/shared/dtos/ref';

export class RolesDTO {
  author?: Ref<UserDTO>;
  reviewer?: Ref<UserDTO>;
}

export class HistoryDTO {
  by: Ref<UserDTO>;
  date: Date | string;
  eventType: HistoryEventTypeType;
  value?: string;
}

export const HistoryEventType = {
  created: 'CREATED',
  updated: 'UPDATED',
  migrated: 'MIGRATED',
} as const;
export type HistoryEventTypeType = typeof HistoryEventType[keyof typeof HistoryEventType];