import mongoose from 'mongoose';
import { QueryFilterDTO } from 'src/shared/dtos/query-filter.dto';

const EQ_NULL = { $eq: null };
export function mongoDBFiltersFromQueryFilter(
  query: QueryFilterDTO,
  regions?: mongoose.Types.ObjectId[],
  search?: string,
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
  if (query.includedLanguages && query.includedLanguages.length > 0) {
    const languageFilters = query.includedLanguages.map(language => ({
      [`variations.title.${language}`]: { $exists: true },
      [`variations.shortDescription.${language}`]: { $exists: true },
      [`variations.description.${language}`]: { $exists: true },
    }));
    innerfilters.push({ $or: languageFilters });
  }
  if (query.excludedLanguages && query.excludedLanguages.length > 0) {
    console.log('languagesNot', query.excludedLanguages);
    const languageFilters = query.excludedLanguages.map(language => ({
      [`variations.title.${language}`]: { $exists: false },
      [`variations.shortDescription.${language}`]: { $exists: false },
      [`variations.description.${language}`]: { $exists: false },
    }));
    outerfilters.push({ $and: languageFilters });
  }


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
      innerfilters.push(...minMaxNumberVariationFilter(key, query[key]));
    }
  });
  if (query.childrenCount != null && query.childrenCount > 0) {
    innerfilters.push(
      ...minMaxNumberVariationFilter('childrenCount', query.childrenCount),
    );
    if (query.childrenAgeGroups && query.childrenAgeGroups.length > 0) {
      innerfilters.push(
        ...minMaxNumberVariationFilter(
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
    innerfilters.push(createVariationSetFilter('regions', ids));
  }
  if (query.parentGender) {
    innerfilters.push(
      createVariationSetFilter('parentGender', [query.parentGender]),
    );
  }
  if (query.insurance) {
    innerfilters.push(
      createVariationSetFilter('insurances', [query.insurance]),
    );
  }
  if (query.jobRelatedSituation != undefined) {
    innerfilters.push(
      createVariationSetFilter('jobRelatedSituations', [
        query.jobRelatedSituation,
      ]),
    );
  }
  if (query.relationship != undefined) {
    innerfilters.push(
      createVariationSetFilter('relationships', [query.relationship]),
    );
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
    if (search && search.length) {
      return { name: { $regex: search, $options: 'i' } };
    }
    return { _id: { $ne: '' } };
  }
  return {
    $and: [
      ...outerfilters,
      ...(search ? [{ name: { $regex: search, $options: 'i' } }] : []),
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
export function mongoDBMinFiltersFromQueryFilter(
  query: QueryFilterDTO,
  regions?: mongoose.Types.ObjectId[],
) {
  const outerfilters = [];
  if (query.category) {
    outerfilters.push({
      $or: [
        {
          'categories._id': new mongoose.Types.ObjectId(query.category),
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
      outerfilters.push({ ['status']: { $in: query.status } });
    } else {
      outerfilters.push({ ['status']: query.status });
    }
  }
  if (query.filterByDate) {
    const now = new Date();
    outerfilters.push({
      $or: [
        { [`timespan.from`]: EQ_NULL },
        { [`timespan.from`]: { $lte: now } },
      ],
    });
    outerfilters.push({
      $or: [{ [`timespan.to`]: EQ_NULL },{ [`timespan.to`]: { $gte: now } }],
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
    innerfilters.push({ 'childrenCount.min': EQ_NULL });
    innerfilters.push({ 'childrenCount.max': EQ_NULL });
    innerfilters.push({ 'childrenAge.min': EQ_NULL });
    innerfilters.push({ 'childrenAge.max': EQ_NULL });
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
    innerfilters.push({ [`isPregnant`]: { $eq: false } });
  }
  if (query.isRefugee === false) {
    innerfilters.push({ [`isRefugee`]: { $eq: false } });
  }
  if (query.isVictimOfViolence === false) {
    innerfilters.push({
      [`isVictimOfViolence`]: { $eq: false },
    });
  }

  if (innerfilters.length == 0 && outerfilters.length == 0) {
    return {};
  }
  if (innerfilters.length > 0) {
    return {
      $and: [
        ...outerfilters,
        {
          $or: [
            { filters: { $size: 0 } },
            { filters: { $elemMatch: { $and: innerfilters } } },
          ],
        },
      ],
    };
  } else {
    return {
      $and: [
        ...outerfilters,
        {
          $or: [
            { filters: { $size: 0 } },
          ],
        },
      ],
    };
  }
}

/**
 * MATCH Filter Generators
 */

export function createSetFilter(key: string, value: any[]) {
  const objectKey = `${key}`;
  return {
    $or: [{ [objectKey]: { $size: 0 } }, { [objectKey]: { $in: value } }],
  };
}
export function createVariationSetFilter(key: string, value: any[]) {
  const objectKey = `variations.filters.${key}`;
  return {
    $or: [{ [objectKey]: { $size: 0 } }, { [objectKey]: { $in: value } }],
  };
}
export function minMaxNumberVariationFilter(key: string, value: number) {
  return [
    singleNumberVariationFilter(key, value, 'min'),
    singleNumberVariationFilter(key, value, 'max'),
  ];
}
export function singleNumberVariationFilter(
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
  const objectKey = `${key}.${type}`;
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
