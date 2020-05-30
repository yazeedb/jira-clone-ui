export const appRoutes = {
  index: '/',
  projects: '/projects',
  board: '/board/:orgId/:projectKey',
  people: '/people'
};

export const createBoardRoute = (orgId: string, projectKey: string) =>
  `/board/${orgId}/${projectKey}`;
