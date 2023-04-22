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
    status?: string | string[];
    filterByDate?: boolean;
    keyOperation?: 'IN' | 'NIN';
    keys?: string[] | string;
  }
  
  export function queryFilterParser(input: any): QueryFilterDTO {
    const query: QueryFilterDTO = {
      filterByDate: !!input.filterByDate ? input.filterByDate == 'true' : false,
    };
    if (input.status) query.status = input.status;
    if (input.limit) query.limit = +input.limit;
    if (input.skip) query.skip = +input.skip;
    if (input.rent) query.rent = +input.rent;
    if (input.income) query.income = +input.income;
    if (input.childrenCount) query.childrenCount = +input.childrenCount;
    if (input.parentAge) query.parentAge = +input.parentAge;
    if (input.parentGender) query.parentGender = input.parentGender;
    if (input.language) query.language = input.language;
    if (input.category) query.category = input.category;
    if (input.zip) query.zip = input.zip;
    if (input.insurance) query.insurance = input.insurance;
    if (input.jobRelatedSituation) query.jobRelatedSituation = +input.jobRelatedSituation;
    if (input.relationship) query.relationship = +input.relationship;
    if (input.childrenAgeGroups) {
      if(Array.isArray(input.childrenAgeGroups)){
        query.childrenAgeGroups = [];
        input.childrenAgeGroups.forEach((ageGroup) => {
          query.childrenAgeGroups.push(+ageGroup);
        });
      } else {
        query.childrenAgeGroups = [input.childrenAgeGroups];
      }
    }
    if (input.keyOperation) query.keyOperation = input.keyOperation;
    if (input.keys) {
      if (Array.isArray(input.keys)) {
        query.keys = input.keys;
      } else {
        query.keys = [input.keys];
      }
    }
    return query;
  }