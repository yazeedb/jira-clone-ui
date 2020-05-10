import { Machine, assign, DoneInvokeEvent } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { Org, OrgsResponse } from 'shared/interfaces/Org';
import { Project, ProjectsResponse } from 'shared/interfaces/Project';

interface MachineContext {
  orgs: Org[];
  projects: Project[];
  orgsErrorMessage: string;
  projectsErrorMessage: string;
}

export const projectsMachine = Machine<MachineContext>(
  {
    initial: 'fetchingOrgs',
    context: {
      orgs: [],
      projects: [],
      orgsErrorMessage: '',
      projectsErrorMessage: ''
    },
    states: {
      fetchingOrgs: {
        invoke: {
          src: 'fetchOrgs',
          onDone: {
            target: 'fetchingProjects',
            actions: 'updateOrgs'
          },
          onError: {
            target: 'fetchOrgFailed',
            actions: 'updateorgsErrorMessage'
          }
        }
      },
      fetchingProjects: {
        invoke: {
          src: 'fetchProjects',
          onDone: {
            target: 'viewingProjects',
            actions: 'updateProjects'
          },
          onError: {
            target: 'fetchProjectsFailed',
            actions: 'updateFetchProjectsErrorMessage'
          }
        }
      },
      fetchOrgFailed: {
        on: { RETRY: 'fetchingOrgs' }
      },
      viewingProjects: {},
      fetchProjectsFailed: {}
    }
  },
  {
    services: {
      fetchOrgs: () => fetcher(apiRoutes.orgs),

      fetchProjects: (context, event) =>
        fetcher(apiRoutes.getProjectsByOrg(context.orgs[0].id))
    },
    actions: {
      updateOrgs: assign({
        orgs: (context, event) => {
          const e = event as DoneInvokeEvent<OrgsResponse>;

          return e.data.data.orgs;
        }
      }),
      updateorgsErrorMessage: assign({
        orgsErrorMessage: (context, event) => {
          const e = event as DoneInvokeEvent<Error>;

          return e.data.message;
        }
      }),
      updateProjects: assign({
        projects: (context, event) => {
          const e = event as DoneInvokeEvent<ProjectsResponse>;

          return e.data.data.projects;
        }
      }),
      updateFetchProjectsErrorMessage: assign({
        projectsErrorMessage: (context, event) => {
          const e = event as DoneInvokeEvent<Error>;

          return e.data.message;
        }
      })
    }
  }
);
