import { StateType } from "./types.dto";

export interface createRegionDTO {
  zips: string;
  name: string;
  status: string;
}
export interface updateRegionDTO {
  zips?: string;
  name?: string;
  status?: string;
}

export interface RegionDTO {
  id: number;
  status: StateType;
  name: string;
  zips: string;
}