export interface Region {
  id: number;
  zips: string[];
  content: {
    [language: string]: {
      name: string
    }
  }
}
export const State = {
  published : "PUBLISHED",
  archived : "ARCHIVED",
  inEdit : "IN_EDIT",
  inTesting : "IN_TESTING",
  reopend : "REOPEND",
  ready : "READY",
  errorFound : "ERROR_FOUND",
} as const;
export type StateType = typeof State[keyof typeof State];
export const Gender = {
  female : "FEMALE",
  male : "MALE",
  diverse : "DIVERSE",
} as const;
export type GenderType = typeof Gender[keyof typeof Gender];

export interface ObjectStatus {
  oldId: number;
  status: StateType;
  created?: { by: UserDTO; date: Date }
  updated?: { by: UserDTO; date: Date }
}

export interface AuthorInformation {
  name: string;
  specific: string,
}

export interface UserDTO {
  _id: string;
  oldId: string;
  name: string;
  email: string;
  role: string;
}
export interface createUserDTO {
  name: string;
  oldId: string;
  password: string;
  email: string;
  role: string;
}

export interface IdNameTupel {
  id: number;
  name: string;
}
export interface Variable { // Are ther different Variables ???
  key: string;
  value: string; // are there different Values ???
}
export interface numberFilter { min: number; max: number }



export interface QueryFilterDTO {
  limit?: number;
  skip?: number;
  language?: string;
  category?: string;
  rent?: number;
  income?: number;
  childrenCount?: number;
  childrenAgeGroups?: number[];
  parentAge?: number;
  parentGender?: string;
  zip?: string;
  insurance?: string;
  jobRelatedSituation?: number | undefined;
  relationship?: number | undefined;
  keys?: string[] | string;
  status: string;
  filterByDate: boolean;
}

export function queryFilterParser(input: any): QueryFilterDTO {
  const query: QueryFilterDTO = {
    status: input.status? input.status:"published",
    filterByDate: !!input.filterByDate
  }
  if(input.limit){
    query.limit = +input.limit;
  }
  if(input.skip){
    query.skip = +input.skip;
  }
  if(input.skip){
    query.skip = +input.skip;
  }
  if(input.rent){
    query.rent = +input.rent;
  }
  if(input.income){
    query.income = +input.income;
  }
  if(input.childrenCount){
    query.childrenCount = +input.childrenCount;
  }
  if(input.parentAge){
    query.parentAge = +input.parentAge;
  }
  if(input.parentGender){
    query.parentGender = input.parentGender;
  }
  if(input.language){
    query.language = input.language;
  }
  if(input.category){
    query.category = input.category;
  }
  if(input.zip){
    query.zip = input.zip;
  }
  if(input.insurance){
    query.insurance = input.insurance;
  }
  if(input.jobRelatedSituation){
    query.jobRelatedSituation = +input.jobRelatedSituation;
  }
  if(input.relationship){
    query.relationship = +input.relationship;
  }
  if(input.childrenAgeGroups) {
    query.childrenAgeGroups = [];
    input.childrenAgeGroups.forEach(ageGroup => {
      query.childrenAgeGroups.push(+ageGroup)
    });
  }
  if(input.keys){
    if(Array.isArray(input.keys)){
      query.keys = input.keys;
    } else {
      query.keys = [input.keys];
    }
  }
  return query;
}

// export function queryFilterParser(input: any): QueryFilterDTO {
//   const query: QueryFilterDTO = {
//     status: input.status || "published",
//     filterByDate: !!input.filterByDate
//   };

//   const queryParamNames = ["limit", "skip", "rent", "income", "childrenCount", "parentAge", "parentGender",
// "language", "category", "zip", "insurance", "jobRelatedSituation", "relationship", "childrenAgeGroups", "keys"];
//   queryParamNames.forEach((paramName) => {
//     if (input[paramName]) {
//       if (paramName === "childrenAgeGroups") {
//         query.childrenAgeGroups = input.childrenAgeGroups.map(ageGroup => +ageGroup);
//       } else if (paramName === "keys") {
//         query.keys = Array.isArray(input.keys) ? input.keys : [input.keys];
//       } else {
//         query[paramName] = +input[paramName] || input[paramName];
//       }
//     }
//   });

//   return query;
// }