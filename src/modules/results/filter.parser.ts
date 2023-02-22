import mongoose from 'mongoose';
import { QueryFilterDTO } from 'src/types/types.dto';

export async function mongoDBFiltersFromQueryFilter(query: QueryFilterDTO, regions: any[]) {
  const outerfilters = [];
  if (query.category) {
    outerfilters.push({
      $or: [
        {
            categories: new mongoose.Types.ObjectId(query.category),
        },
        {
            categories: { $size: 0 },
        },
    ],
});
}
if (query.status) {
    outerfilters.push({ status: { $eq: query.status } });
  }
  const innerfilters = [];
  if (query.rent != null && ++query.rent >= 0) {
    innerfilters.push(
      minFilter('rent', +query.rent),
      maxFilter('rent', +query.rent),
    );
  } else {
    innerfilters.push(
      { 'rent.min': { $eq: null } },
      { 'rent.max': { $eq: null } },
    );
  }
  if (query.income != null && query.income >= 0) {
    innerfilters.push(
      minFilter('income', +query.income),
      maxFilter('income', +query.income),
    );
  } else {
    innerfilters.push(
      { 'income.min': { $eq: null } },
      { 'income.max': { $eq: null } },
    );
  }
  if (query.childrenCount != null && +query.childrenCount > 0) {
    innerfilters.push(
      minFilter('childrenCount', +query.childrenCount),
      maxFilter('childrenCount', +query.childrenCount),
    );
    if (query.childrenAgeGroups && query.childrenAgeGroups.length > 0) {
      innerfilters.push(
        minFilter(
          'childrenAge',
          Math.max(...(<number[]>query.childrenAgeGroups)),
        ),
        maxFilter(
          'childrenAge',
          Math.min(...(<number[]>query.childrenAgeGroups)),
        ),
      );
    } else {
      innerfilters.push(
        { 'childrenAge.min': { $eq: null } },
        { 'childrenAge.max': { $eq: null } },
      );
    }
  } else {
    innerfilters.push(
      { 'childrenCount.min': { $eq: null } },
      { 'childrenCount.max': { $eq: null } },
    );
  }
  if (query.parentAge && +query.parentAge >= 0) {
    innerfilters.push(
      minFilter('parentAge', +query.parentAge),
      maxFilter('parentAge', +query.parentAge),
    );
  }
  if (query.zip) {
    innerfilters.push({
      $or: [
        { $and: [{ zips: { $size: 0 } }, { regions: { $size: 0 } }] },
        { zips: { $in: [`${query.zip}`] } },
        { regions: { $in: regions } },
      ],
    });
  }
  if (query.parentGender) {
    innerfilters.push({
      $or: [
        { parentGender: { $size: 0 } },
        { parentGender: { $in: [`${query.parentGender}`] } },
      ],
    });
  } else {
    innerfilters.push({ parentGender: { $size: 0 } });
  }
  if (query.insurance) {
    innerfilters.push({
      $or: [
        { insurances: { $size: 0 } },
        { insurances: { $in: [query.insurance] } },
      ],
    });
  }
  if (query.jobRelatedSituation != undefined) {
    innerfilters.push({
      $or: [
        { jobRelatedSituations: { $size: 0 } },
        {
          jobRelatedSituations: {
            $in: [query.jobRelatedSituation],
          },
        },
      ],
    });
  }

  //DONE
  if (query.relationship != undefined) {
    innerfilters.push({
      $or: [
        { relationships: { $size: 0 } },
        { relationships: { $in: [query.relationship] } },
      ],
    });
  }

  //DONE
  innerfilters.push({
    requiredKeys: {
      $not: {
        $elemMatch: {
          $nin: query.keys ? query.keys : [],
        },
      },
    },
  });
  
  
  
  return {
    $and: [
      ...outerfilters,
      {
        filters: {
          $elemMatch: { $and: innerfilters },
        },
      },
    ],
  };
}

export function minFilter(key: string, value: number) {
  const f0 = {};
  f0[key + '.min'] = { $lte: value };
  const f1 = {};
  f1[key + '.min'] = { $eq: null };
  return {
    $or: [f0, f1],
  };
}
export function maxFilter(key: string, value: number) {
  const f0 = {};
  f0[key + '.max'] = { $gte: value };
  const f1 = {};
  f1[key + '.max'] = { $eq: null };
  return {
    $or: [f0, f1],
  };
}
export function lookUp(collection: string) {
  return {
    $lookup: {
      from: collection,
      localField: collection,
      foreignField: '_id',
      as: collection,
    },
  };
}
