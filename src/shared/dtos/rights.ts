export type rightNames = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH';
<<<<<<< HEAD
export type documentNames = 'EVENTS' | 'RESULTS' | 'LOCATIONS' | 'USERS' | 'INSURANCES'|'REGIONS';
export type right = `${documentNames}_${rightNames}`;
=======
export type documentNames = 'EVENTS' | 'RESULTS' | 'LOCATIONS' | 'USERS' | 'INSURANCES';
export type right = `${documentNames}_${rightNames}`;
>>>>>>> 647dde1 (add the requests to the backend and tested them)
