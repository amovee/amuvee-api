import mongoose from 'mongoose';
import { QueryFilterDTO } from 'src/shared/dtos/query-filter.dto';

const EQ_NULL = { $eq: null };
export function mongoDBFiltersFromQueryFilter(
  query: QueryFilterDTO,
  regions?: mongoose.Types.ObjectId[],
) {
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
  const innerfilters = [];
  if (query.status) {
    if (Array.isArray(query.status)) {
      innerfilters.push({ ['variations.status']: { $in: query.status } });
    } else {
      innerfilters.push({ ['variations.status']: query.status });
    }
  }
  if (query.filterByDate) {
    const now = new Date();
    innerfilters.push({
      $or: [
        { [`variations.timespan.from`]: EQ_NULL },
        { [`variations.timespan.from`]: { $lte: now } },
      ],
    });
    innerfilters.push({
      $or: [
        { [`variations.timespan.to`]: EQ_NULL },
        { [`variations.timespan.to`]: { $gte: now } },
      ],
    });
  }
  ['rent', 'income', 'parentAge'].forEach((key: string) => {
    if (query[key] != null && query[key] >= 0) {
      innerfilters.push(...minMaxNumberFilter(key, query[key]));
    }
  });
  if (query.childrenCount != null && query.childrenCount > 0) {
    innerfilters.push(
      ...minMaxNumberFilter('childrenCount', query.childrenCount),
    );
    if (query.childrenAgeGroups && query.childrenAgeGroups.length > 0) {
      innerfilters.push(
        ...minMaxNumberFilter(
          'childrenAge',
          Math.max(...(<number[]>query.childrenAgeGroups)),
        ),
      );
    }
  } else if (query.childrenCount == 0) {
    innerfilters.push({ 'variations.filters.childrenCount.min': EQ_NULL });
    innerfilters.push({ 'variations.filters.childrenCount.max': EQ_NULL });
    innerfilters.push({ 'variations.filters.childrenAge.min': EQ_NULL });
    innerfilters.push({ 'variations.filters.childrenAge.max': EQ_NULL });
  }
  if (regions) {
    const ids = regions.map((r) => new mongoose.Types.ObjectId(r));
    innerfilters.push(createSetFilter('regions', ids));
  }
  if (query.parentGender) {
    innerfilters.push(createSetFilter('parentGender', [query.parentGender]));
  }
  if (query.insurance) {
    innerfilters.push(createSetFilter('insurances', [query.insurance]));
  }
  if (query.jobRelatedSituation != undefined) {
    innerfilters.push(
      createSetFilter('jobRelatedSituations', [query.jobRelatedSituation]),
    );
  }
  if (query.relationship != undefined) {
    innerfilters.push(createSetFilter('relationships', [query.relationship]));
  }
  if (query.isPregnant === false) {
    innerfilters.push({ [`variations.filters.isPregnant`]: { $eq: false } });
  }
  if (query.isRefugee === false) {
    innerfilters.push({ [`variations.filters.isRefugee`]: { $eq: false } });
  }
  if (query.isVictimOfViolence === false) {
    innerfilters.push({
      [`variations.filters.isVictimOfViolence`]: { $eq: false },
    });
  }

  if (innerfilters.length == 0 && outerfilters.length == 0) {
    return { _id: { $ne: '' } };
  }
  return {
    $and: [
      ...outerfilters,
      ...(innerfilters.length > 0
        ? [
            {
              $and: innerfilters,
            },
          ]
        : []),
    ],
  };
}

/**
 * MATCH Filter Generators
 */

export function createSetFilter(key: string, value: any[]) {
  const objectKey = `variations.filters.${key}`;
  return {
    $or: [{ [objectKey]: { $size: 0 } }, { [objectKey]: { $in: value } }],
  };
}
export function minMaxNumberFilter(key: string, value: number) {
  return [
    singleNumberFilter(key, value, 'min'),
    singleNumberFilter(key, value, 'max'),
  ];
}
export function singleNumberFilter(
  key: string,
  value: number,
  type: 'min' | 'max',
) {
  const objectKey = `variations.filters.${key}.${type}`;
  const comparator = type === 'min' ? { $lte: value } : { $gte: value };
  return {
    $or: [{ [objectKey]: EQ_NULL }, { [objectKey]: comparator }],
  };
}

/**
 * PROJECTION Generators
 */

const FILTER_KEYS = [
  'rent',
  'income',
  'childrenCount',
  'childrenAge',
  'parentAge',
  'parentGender',
  'regions',
  'requiredKeys',
  'insurances',
  'relationships',
  'jobRelatedSituations',
];
const META_KEYS = ['status', 'specific', 'roles', 'name', 'categories'];
export function getVariationProjection(min?: 'min') {
  const fields = min
    ? { v_id: '$variations._id' }
    : {
        v_id: '$variations._id',
        variationName: '$variations.name',
      };
  ['_id', 'id', 'type', ...(min ? [] : META_KEYS)].forEach((key) => {
    fields[key] = 1;
  });

  [
    'timespan',
    'amountOfMoney',
    'content',
    'actions',
    'locations',
    'variables',
    ...(min ? [] : FILTER_KEYS),
  ].forEach((key) => {
    fields[key] = `$variations.${key}`;
  });
  return fields;
}

/**
 * Functions to generate other Stages for MongoDB Aggregations
 */

export function unwind(path: string): { $unwind: { path: string } } {
  return { $unwind: { path: path } };
}
export function lookUpInVariation(from: string, to?: string) {
  return {
    $lookup: {
      from: from,
      localField: to ? to : 'variations.' + from,
      foreignField: '_id',
      as: to ? to : 'variations.' + from,
    },
  };
}
export function lookUp(from: string, to?: string) {
  return {
    $lookup: {
      from: from,
      localField: to ? to : from,
      foreignField: '_id',
      as: to ? to : from,
    },
  };
}
export function getUserLookUpOperations(type: string) {
  return [
    {
      $lookup: {
        from: 'users',
        localField: type + '.by',
        foreignField: '_id',
        as: type + '.by',
      },
    },
    {
      $addFields: {
        [type + '.by']: {
          $arrayElemAt: ['$' + type + '.by', 0],
        },
      },
    },
    {
      $project: {
        [type + '.by.password']: 0,
        [type + '.by.rights']: 0,
        [type + '.by.isAdmin']: 0,
        [type + '.by.oldId']: 0,
        [type + '.by.email']: 0,
      },
    },
  ];
}
