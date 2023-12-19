import { StateType } from "./types.dto";

export interface createRegionDTO {
  id?: number;
  zips: string;
  name: string;
  status: string;
}
export interface updateRegionDTO {
  id?: number;
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