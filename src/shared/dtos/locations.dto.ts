import { ApiProperty } from "@nestjs/swagger";
import { HistoryDTO, RolesDTO } from "./roles.dto";
import { State, StateType } from "./types.dto";

export interface LocationDTO {
  _id: string;
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
  history: HistoryDTO[];
}
export class Address {
  @ApiProperty()
  street: string;

  @ApiProperty()
  houseNr: string;

  @ApiProperty()
  zip: string;

  @ApiProperty()
  place: string;

  @ApiProperty()
  city: string;
}

export class Position {
  @ApiProperty({ description: 'Longitude' })
  lon: number;

  @ApiProperty({ description: 'Latitude' })
  lat: number;
}
export class CreateLocationDTO {
  @ApiProperty({
    enum: Object.values(State),
  })
  status: StateType;

  @ApiProperty()
  name: string;

  @ApiProperty({
    type: () => Address,
  })
  address: Address;

  @ApiProperty()
  link: string;

  @ApiProperty({
    type: () => Position,
  })
  position?: Position;
}
export class UpdateLocationDTO {
  @ApiProperty({
    enum: Object.values(State),
  })
  status?: StateType;

  @ApiProperty()
  name?: string;

  @ApiProperty({
    type: () => Address,
  })
  address?: Address;

  @ApiProperty()
  link?: string;

  @ApiProperty({
    type: () => Position
  })
  position?: Position;
}

export type MinLocationDTO = Omit<LocationDTO, 'status' | 'roles'>
