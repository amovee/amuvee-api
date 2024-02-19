import { ApiProperty } from "@nestjs/swagger";

export class QueryFilterDTO {
  @ApiProperty({ required: false })
  limit?: number;
  @ApiProperty({ required: false })
  skip?: number;
  @ApiProperty({ required: false })
  language?: string;
  @ApiProperty({ required: false })
  category?: string;
  @ApiProperty({ required: false })
  rent?: number;
  @ApiProperty({ required: false })
  income?: number;
  @ApiProperty({ required: false })
  childrenCount?: number;
  @ApiProperty({ required: false })
  childrenAgeGroups?: number[];
  @ApiProperty({ required: false })
  parentAge?: number;
  @ApiProperty({ required: false })
  parentGender?: string;
  @ApiProperty({ required: false })
  zip?: string;
  @ApiProperty({ required: false })
  insurance?: string;
  @ApiProperty({ required: false })
  jobRelatedSituation?: number | undefined;
  @ApiProperty({ required: false })
  relationship?: number | undefined;
  @ApiProperty({ required: false })
  status?: string | string[];
  @ApiProperty({ required: false })
  filterByDate?: boolean;
  @ApiProperty({ required: false })
  isPregnant?: boolean;
  @ApiProperty({ required: false })
  isVictimOfViolence?: boolean;
  @ApiProperty({ required: false })
  isRefugee?: boolean;
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
  if (input.jobRelatedSituation)
    query.jobRelatedSituation = +input.jobRelatedSituation;
  if (input.relationship) query.relationship = +input.relationship;
  if (input.childrenAgeGroups) {
    if (Array.isArray(input.childrenAgeGroups)) {
      query.childrenAgeGroups = [];
      input.childrenAgeGroups.forEach((ageGroup) => {
        query.childrenAgeGroups.push(+ageGroup);
      });
    } else {
      query.childrenAgeGroups = [input.childrenAgeGroups];
    }
  }
  if (input.isPregnant != undefined) {
    query.isPregnant = input.isPregnant == 'true' ? true : false;
  }
  if (input.isRefugee != undefined) {
    query.isRefugee = input.isRefugee == 'true' ? true : false;
  }
  if (input.isVictimOfViolence != undefined) {
    query.isVictimOfViolence = input.isVictimOfViolence == 'true' ? true : false;
  }
  return query;
}
