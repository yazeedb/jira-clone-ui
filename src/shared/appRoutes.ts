export const appRoutes = {
  index: '/',
  projects: '/projects',
  board: '/board/:orgName/:projectKey',
  people: '/people'
};

export const createBoardRoute = (orgName: string, projectKey: string) =>
  `/board/${orgName}/${projectKey}`;
