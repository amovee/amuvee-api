import { Action } from "./action.interface";
import { ContentMeta } from "./content-meta.interface";
import { Insurance } from "./insrance.interface";
import { Location } from "./location.interface";

export interface Result extends ContentMeta {
    name: string; 
    shortDescription: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: Location | number;
    actions: (Action | number)[];
    type: ResultType | number;
    amountMoney: {min: number, max: number};
    filters: Filter[];
}
export interface ResultType {
    name: string;
    weight: number;
}

export interface Filter {
    rent: NumericFilter;
    income: NumericFilter;
    childrenCount: NumericFilter;
    childrenAge: NumericFilter;
    zip: string[];
    keyword: {includes: boolean, values: string[]}; // victimOfViolence, pregnant
    insurances: Insurance[]; // only if in insurance
    relationships: { includes: boolean, values: RelationshipType[]};
    jobSituations: { includes: boolean, values: JobSituationType[]};
}
enum RelationshipType {}
enum JobSituationType {}

export interface NumericFilter {
    min: number;
    max: number;
}