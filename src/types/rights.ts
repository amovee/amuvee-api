export type rightNames = 'GET' | 'POST' | 'UPDATE' | 'DELETE' | 'PUBLISH';
export type documentNames = 'EVENTS' | 'RESULTS' | 'LOCATIONS' | 'USERS';
export type right = `${documentNames}_${rightNames}`;