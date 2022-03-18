export interface Answers {
  zip: string;
  rent: number;
  income: number;
  childrenCount: number;
  childrenAge: { min: number; max: number };
  keywords: string[];
  insurance: string; //ID
  relationship: string; //ID
  jobSituation: string; //ID
}