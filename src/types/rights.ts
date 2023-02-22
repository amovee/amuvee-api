export const RIGHT_TYPE_COST = ['GET', 'POST', 'UPDATE', 'DELETE', 'PUBLISH'] as const;
export type document = 'EVENTS' | 'RESULTS' | 'LOCATIONS';
export type rightType = typeof RIGHT_TYPE_COST[number];
export type rights = {
  [key in document]?: rightType[];
};