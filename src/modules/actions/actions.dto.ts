import { AuthorInformation, ObjectStatus } from 'src/types/types.dto';

// Gibt es Aktionen, die nur für Geflüchtete sind
export interface createActionDTO extends ObjectStatus, AuthorInformation {
  _id: string;
  content: {
    [languageKey: string]: {
      name: string;
      description: string;
    };
  };
}

export interface getFormattedActionDTO {
  id: string;
  content: {
    [languageKey: string]: {
      name: string;
      description: string;
    };
  };
}
