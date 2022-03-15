export const generateRentFilter = (rent: number) => ({
  $and: [
    {
      $or: [{ 'filter.rent.max': null }, { 'filter.rent.max': { $gte: rent } }],
    },
    {
      $or: [{ 'filter.rent.min': null }, { 'filter.rent.min': { $lte: rent } }],
    },
  ],
});
export const generateRegionFilter = (zip: string, regionIds: any[]) => ({
  $or: [
    {
      'filter.regions': {
        $in: regionIds,
      },
    },
    {
      'filter.zips': {
        $in: [zip],
      },
    },
    {
      $and: [
        {
          'filter.regions': {
            $size: 0,
          },
        },
        {
          'filter.zips': {
            $size: 0,
          },
        },
      ],
    },
  ],
});

export const generateChildrenCountFilter = (childrenCount: number) => ({
  $and: [
    {
      $or: [
        { 'filter.childrenCount.max': null },
        { 'filter.childrenCount.max': { $gte: childrenCount } },
      ],
    },
    {
      $or: [
        { 'filter.childrenCount.min': null },
        { 'filter.childrenCount.min': { $lte: childrenCount } },
      ],
    },
  ],
});
export const generateRelationships = (relationship: string) => ({
  $or: [
    {
      'filter.relationships': {
        $in: relationship,
      },
    },
    {
      'filter.relationships': { $size: 0 },
    },
  ],
});
export const generateInsuranceFilter = (insurance) => ({
  $or: [
    {
      'filter.insurances': {
        $in: insurance,
      },
    },
    {
      'filter.insurances': { $size: 0 },
    },
  ],
});
export const generateUnrequiredKeywordsFilter = (keywords: string[]) => ({
  $or: [
    {
      'filter.unrequiredKeywords': {
        $not: { $in: [keywords] },
      },
    },
    { 'filter.unrequiredKeywords': { $not: { $size: 0 } } },
  ],
});
export const generateRequiredKeywordsFilter = (keywords: string[]) => ({
  $or: [
    { 'filter.requiredKeywords': { $in: [keywords] } },
    { 'filter.requiredKeywords': { $size: 0 } },
  ],
});
export const generateIncomeMaxFilter = (income: number) => ({
  $or: [
    { 'filter.income.max': null },
    { 'filter.income.max': { $gte: income } },
  ],
});

export const generateIncomeMinFilter = (income: number) => ({
  $or: [
    { 'filter.income.min': null },
    { 'filter.income.min': { $lte: income } },
  ],
});
export const generateJobSituationFilter = (jobSituation: string) => ({
  $or: [
    {
      'filter.jobSituations': {
        $in: jobSituation,
      },
    },
    {
      'filter.jobSituations': { $size: 0 },
    },
  ],
});
export const generateChildrenAge = (age: number) => ({$and:[{
    $or: [
      { 'filter.childrenAge.max': null },
      { 'filter.childrenAge.max': { $gte: age } },
    ],
  }, {
    $or: [
      { 'filter.childrenAge.min': null },
      { 'filter.childrenAge.min': { $lte: age } },
    ],
  }]})