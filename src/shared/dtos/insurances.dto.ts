import { IdNameTupel } from "./types.dto";

export interface createInsuranceDTO extends IdNameTupel {
  weight: number;
  isPublicInsurance: boolean;
}
export interface createInsurance {
  name: string;
  isPublic: boolean;
  status: string;
}
export interface updateInsurance {
  name?: string;
  isPublic?: boolean;
  status?: string;
}