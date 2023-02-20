import { IdNameTupel } from "src/types/types.dto";

export interface createInsuranceDTO extends IdNameTupel {
    weight: number;
    isPublicInsurance: boolean;
  }