export type rightNames = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH';
export type documentNames = 'EVENTS' | 'RESULTS' | 'LOCATIONS' | 'USERS' | 'INSURANCES'|'REGIONS';
export type right = `${documentNames}_${rightNames}`;
