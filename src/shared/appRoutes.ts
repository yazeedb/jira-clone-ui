import { FindOneProjectParams } from './interfaces/Project';

export const appRoutes = {
  index: '/',
  projects: '/projects',
  board: '/board/:orgName/:projectKey',
  people: '/people'
};

export const createBoardRoute = ({
  orgName,
  projectKey
}: FindOneProjectParams) => `/board/${orgName}/${projectKey}`;
