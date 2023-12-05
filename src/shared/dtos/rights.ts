export type rightNames = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH';
export type documentNames = 'EVENTS' | 'RESULTS' | 'LOCATIONS' | 'USERS' | 'REGIONS';
export type right = `${documentNames}_${rightNames}`;
