export type OrgName = string;

export interface Org {
  id: string;
  ownerId: string;
  name: OrgName;
  dateCreated: string;
}

export interface OrgsResponse {
  orgs: Org[];
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
