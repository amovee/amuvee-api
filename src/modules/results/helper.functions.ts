import mongoose from 'mongoose';
import { QueryFilterDTO } from 'src/shared/dtos/query-filter.dto';
import { MinActionDTO } from 'src/shared/dtos/actions.dto';
import { MinResultDTO, ResultType } from 'src/shared/dtos/results.dto';

function filterResultTypeLanguage(type: ResultType, language?: string) {
  if (type?.name[language]) {
    type.name = {
      [language]: type.name[language],
    };
  } else if (type['de']) {
    type.name = {
      ['de']: type.name['de'],
    };
  } else {
    // TODO: Fälle testen?
    type.name = {};
  }
  return type;
}
function filterResultContentLanguage(
  content: {
    [language: string]: {
      title: string;
      shortDescription: string;
      description: string;
    };
  },
  language: string,
) {  
  if (content && content[language]) {
    content = {
      [language]: content[language],
    };
  } else if (content && content['de']) {
    content = {
      ['de']: content['de'],
    };
  } else {
    content = {};
  }
  return content;
}
function filterActionLanguage(action: MinActionDTO, language: string) {
  if (action.content && action.content[language]) {
    action.content = {
      [language]: action.content[language],
    };
  } else if (action.content['de']) {
    action.content = {
      ['de']: action.content['de'],
    };
  } else {
    action.content = {};
  }
  return action;
}
export function filterResultLanguage(
  res: MinResultDTO,
  language?: string,
): MinResultDTO {
  if (language) {
    res.content = filterResultContentLanguage(res.content, language);
    res.type = filterResultTypeLanguage(res.type, language);
    res.actions.forEach((action: MinActionDTO) => {
      action = filterActionLanguage(action, language);
    });
  }
  return res;
}

export async function mongoDBFiltersFromQueryFilter(
  query: QueryFilterDTO,
  regions?: string[],
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
  if (query.status) {
    if (Array.isArray(query.status)) {
      outerfilters.push({ status: { $in: query.status } });
    } else {
      outerfilters.push({ status: query.status });
    }
  }
  const innerfilters = [];
  if (query.rent != null && query.rent >= 0) {
    innerfilters.push(
      numberFilter('rent', query.rent, 'min'),
      numberFilter('rent', query.rent, 'max'),
    );
  }
  if (query.income != null && query.income >= 0) {
    innerfilters.push(
      numberFilter('income', query.income, 'min'),
      numberFilter('income', query.income, 'max'),
    );
  }
  if (query.childrenCount != null && query.childrenCount > 0) {
    innerfilters.push(
      numberFilter('childrenCount', query.childrenCount, 'min'),
      numberFilter('childrenCount', query.childrenCount, 'max'),
    );
    if (query.childrenAgeGroups && query.childrenAgeGroups.length > 0) {
      innerfilters.push(
        numberFilter(
          'childrenAge',
          Math.max(...(<number[]>query.childrenAgeGroups)),
          'min',
        ),
        numberFilter(
          'childrenAge',
          Math.min(...(<number[]>query.childrenAgeGroups)),
          'max',
        ),
      );
    }
  }
  if (query.parentAge && query.parentAge >= 0) {
    innerfilters.push(
      numberFilter('parentAge', query.parentAge, 'min'),
      numberFilter('parentAge', query.parentAge, 'max'),
    );
  }
  if (regions) {
    innerfilters.push({
      $or: [
        { ['variations.regions']: { $size: 0 } },
        { ['variations.regions']: { $in: regions } },
      ],
    });
  }
  if (query.parentGender) {
    innerfilters.push({
      $or: [
        { ['variations.parentGender']: { $size: 0 } },
        { ['variations.parentGender']: { $in: [`${query.parentGender}`] } },
      ],
    });
  }
  if (query.insurance) {
    innerfilters.push({
      $or: [
        { ['variations.insurances']: { $size: 0 } },
        { ['variations.insurances']: { $in: [query.insurance] } },
      ],
    });
  }
  if (query.jobRelatedSituation != undefined) {
    innerfilters.push({
      $or: [
        { ['variations.jobRelatedSituations']: { $size: 0 } },
        {
          ['variations.jobRelatedSituations']: {
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
        { ['variations.relationships']: { $size: 0 } },
        { ['variations.relationships']: { $in: [query.relationship] } },
      ],
    });
  }

  //DONE

  if (Array.isArray(query.keys) && query.keyOperation) {
    if (query.keyOperation == 'IN') {
      innerfilters.push({
        ['variations.requiredKeys']: {
          $not: {
            $elemMatch: {
              $nin: query.keys,
            },
          },
        },
      });
    }
    if (Array.isArray(query.keys) && query.keyOperation == 'NIN') {
      innerfilters.push({
        ['variations.requiredKeys']: {
          $elemMatch: {
            $nin: query.keys,
          },
        },
      });
    }
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

export function numberFilter(key: string, value: number, type: 'min' | 'max') {
  return {
    $or: [
      { [`variations.${key}.${type}`]: { $eq: null } },
      { [`variations.${key}.${type}`]: { $lte: value } },
    ],
  };
}
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
    ? {}
    : {
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
    '_id',
    ...(min ? [] : FILTER_KEYS),
  ].forEach((key) => {
    fields[key] = `$variations.${key}`;
  });
  return fields;
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
