import { HistoryDTO, RolesDTO } from './roles.dto';
import { StateType } from './types.dto';

export interface EventDTO {
  _id: string;
  id: number;
  status: StateType;
  link: string;
  style: string;
  type: string;
  image: string;
  timespan: { from: Date | null; to: Date | null };
  roles: RolesDTO;
  history: HistoryDTO[];
  content?: {
    [language: string]: {
      name: string;
      shortDescription: string;
    };
  };
}