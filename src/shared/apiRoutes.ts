import {
  FindOneProjectParams,
  FindOneColumnParams,
  FindOneTaskParams,
  MoveTaskParams
} from './interfaces/Project';

const apiBase = '/api';

// TODO: Shared HTTP functions.
// Instead of throwing constants all over the place, maybe create HTTP functions
// surrounded by data guarantees.
export const apiRoutes = {
  login: '/login',
  user: `${apiBase}/user`,
  completeSignup: `${apiBase}/completeSignup`,
  orgs: `${apiBase}/orgs`,
  projectsByOrg: (orgId: string) => `${apiBase}/orgs/${orgId}/projects`,

  findOneProject: ({ orgName, projectKey }: FindOneProjectParams) =>
    `${apiBase}/orgs/${orgName}/projects/${projectKey}`,

  columnsByProject: (params: FindOneProjectParams) =>
    `${apiRoutes.findOneProject(params)}/columns`,

  validateProjectName: (orgId: string, projectName: string) =>
    `${apiBase}/orgs/${orgId}/validateProjectName?name=${projectName}`,

  validateProjectKey: (orgId: string, projectKey: string) =>
    `${apiBase}/orgs/${orgId}/validateProjectKey?key=${projectKey}`,

  findOneColumn: ({ orgName, projectKey, columnId }: FindOneColumnParams) =>
    `${apiBase}/orgs/${orgName}/projects/${projectKey}/columns/${columnId}`,

  findOneColumnTasks: (params: FindOneColumnParams) =>
    `${apiRoutes.findOneColumn(params)}/tasks`,

  findOneTask: (params: FindOneTaskParams) => {
    const tasksRoute = apiRoutes.findOneColumnTasks({
      columnId: params.columnId,
      projectKey: params.projectKey,
      orgName: params.orgName
    });

    return `${tasksRoute}/${params.taskId}`;
  },

  renameTask: (params: FindOneTaskParams) =>
    `${apiRoutes.findOneTask(params)}/rename`,

  setColumnLimit: (params: FindOneColumnParams) =>
    `${apiRoutes.findOneColumn(params)}/setColumnLimit`,

  moveColumn: (params: FindOneColumnParams) =>
    `${apiRoutes.findOneColumn(params)}/move`,

  moveTask: (params: MoveTaskParams) => {
    const columnsRoute = `${apiRoutes.findOneColumn({
      orgName: params.orgName,
      projectKey: params.projectKey,
      columnId: params.oldColumnId
    })}`;

    return `${columnsRoute}/moveTask`;
  }
};
