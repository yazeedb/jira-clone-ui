export interface User {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  dateJoined: string;
  profileImg: string;
  headerImg: string;
  jobTitle: string;
  department: string;
  organization: string;
  location: string;
}

// For initial values to make TS happy
export const createEmptyUser = (): User => {
  return {
    sub: '',
    email: '',
    firstName: '',
    lastName: '',
    dateJoined: '',
    profileImg: '',
    headerImg: '',
    jobTitle: '',
    department: '',
    organization: '',
    location: ''
  };
};
