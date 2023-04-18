import { RolesDTO } from 'src/types/roles.dto';
import { StateType } from 'src/types/types.dto';

export interface LocationDTO {
  id: number;
  status: StateType;
  name: string;
  address: {
    street: string;
    houseNr: string;
    zip: string;
    place: string;
    city: string;
  };
  link: string;
  position?: { lon: number; lat: number };
  roles: RolesDTO;
}

export type MinLocationDTO = Omit<LocationDTO, 'status' | 'roles'>
