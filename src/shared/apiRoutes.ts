const apiBase = '/api';

// TODO: Shared HTTP functions.
// Instead of throwing constants all over the place, maybe create HTTP functions
// surrounded by data guarantees.
export const apiRoutes = {
  login: '/login',
  user: `${apiBase}/user`,
  completeSignup: `${apiBase}/completeSignup`,
  orgs: `${apiBase}/orgs`,
  getProjectsByOrg: (orgId: string) => `${apiBase}/orgs/${orgId}/projects`
};
