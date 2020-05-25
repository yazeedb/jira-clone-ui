const apiBase = '/api';

// TODO: Shared HTTP functions.
// Instead of throwing constants all over the place, maybe create HTTP functions
// surrounded by data guarantees.
export const apiRoutes = {
  login: '/login',
  user: `${apiBase}/user`,
  completeSignup: `${apiBase}/completeSignup`,
  orgs: `${apiBase}/orgs`,
  getProjectsByOrg: (orgId: string) => `${apiBase}/orgs/${orgId}/projects`,

  validateProjectName: (orgId: string, projectName: string) =>
    `${apiBase}/orgs/${orgId}/validateProjectName?name=${projectName}`,

  validateProjectKey: (orgId: string, projectKey: string) =>
    `${apiBase}/orgs/${orgId}/validateProjectKey?key=${projectKey}`
};
