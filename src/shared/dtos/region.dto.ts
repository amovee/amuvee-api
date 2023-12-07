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
