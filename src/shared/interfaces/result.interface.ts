import { Action } from "./action.interface";
import { ContentMeta } from "./content-meta.interface";
import { Insurance } from "./insrance.interface";
import { Location } from "./location.interface";

export interface Result extends ContentMeta {
    name: string; 
    // shortDescription: string;
    // description: string;
    // startDate: Date;
    // endDate: Date;
    // location: Location | number;
    // actions: (Action | number)[];
    // type: ResultType | number;
    // amountMoney: {min: number, max: number};
    // filters: Filter[];
}
export interface ResultType {
    name: string;
    weight: number;
}

export interface Filter {
    /**
     * version: 1
     */
    rent: NumericFilter;
    /**
     * version: 1
     */
    income: NumericFilter;
    /**
     * version: 1
     */
    childrenCount: NumericFilter;
    /**
     * version: 1
     */
    childrenAge: NumericFilter;
    /**
     * version: 1
     */
    zip: string[];
    /**
     * version: 1
     */
    keyword: {includes: boolean, values: string[]}; // victimOfViolence, pregnant
    /**
     * version: 1
     */
    insurances: Insurance[]; // only if in insurance
    /**
     * version: 1
     */
    relationships: { includes: boolean, values: RelationshipType[]};
    /**
     * version: 1
     */
    jobSituations: { includes: boolean, values: JobSituationType[]};
}
enum RelationshipType {}
enum JobSituationType {}

export interface NumericFilter {
    min: number;
    max: number;
}