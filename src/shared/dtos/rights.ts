export type rightNames = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH';
export type documentNames = 'EVENTS' | 'RESULTS' | 'LOCATIONS' | 'USERS';
export type right = `${documentNames}_${rightNames}`;