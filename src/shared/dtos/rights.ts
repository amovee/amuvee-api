export type rightNames = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH';
export type documentNames =
  | 'EVENTS'
  | 'RESULTS'
  | 'LOCATIONS'
  | 'USERS'
  | 'INSURANCES'
  | 'REGIONS'
  | 'RESULTTYPES'
  | 'ACTIONS'
  | 'CATEGORY';
export type right = `${documentNames}_${rightNames}`;
