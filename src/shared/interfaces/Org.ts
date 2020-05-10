export interface Org {
  id: string;
  ownerId: string;
  name: string;
  dateCreated: string;
}

export interface OrgsResponse {
  data: {
    orgs: Org[];
  };
}

// For initial values to make TS happy
export const createEmptyOrg = (): Org => {
  return {
    id: '',
    ownerId: '',
    name: '',
    dateCreated: ''
  };
};
