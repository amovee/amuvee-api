import { Result } from 'src/shared/schemas/result.schema';
import { ObjectStatus } from 'src/types/types.dto';
import { Location } from './location.schema';

export interface LocationDTO extends ObjectStatus {
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
  sort: number;
}

export interface getFormattedLocationDTO {
  name: string;
  address: {
    street: string;
    houseNr: string;
    zip: string;
    place: string;
  };
  link: string;
  position?: { lon: number; lat: number };
}
