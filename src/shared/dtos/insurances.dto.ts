import { IdNameTupel } from "./types.dto";

export interface createInsuranceDTO extends IdNameTupel {
  weight: number;
  isPublicInsurance: boolean;
}
