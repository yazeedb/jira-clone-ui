const apiBase = '/api';

export const apiRoutes = {
  login: '/login',
  user: `${apiBase}/user`,
  completeSignup: `${apiBase}/completeSignup`,
  orgs: `${apiBase}/orgs`,
  getProjectsByOrg: (orgId: string) => `${apiBase}/orgs/${orgId}/projects`
};
