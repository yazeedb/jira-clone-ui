import { Machine, assign, DoneInvokeEvent, Interpreter } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { Org, OrgsResponse } from 'shared/interfaces/Org';
import { Project, ProjectsResponse } from 'shared/interfaces/Project';

interface MachineContext {
  orgs: Org[];
  projects: Project[];
  errorMessage: string;
}

export type ProjectsService = Interpreter<MachineContext>;
export const projectsMachine = Machine<MachineContext>(
  {
    id: 'projects',
    initial: 'fetchingProjects',
    context: {
      orgs: [],
      projects: [],
      errorMessage: ''
    },
    states: {
      fetchingProjects: {
        invoke: {
          src: 'fetchProjectsByOrg',
          onDone: {
            target: 'viewingProjects',
            actions: 'setProjects'
          },
          onError: {
            target: 'fetchFailed',
            actions: 'setErrorMessage'
          }
        }
      },
      viewingProjects: {
        initial: 'idle',
        states: {
          idle: {
            on: { CREATE_PROJECT: 'creatingProject' }
          },
          creatingProject: {
            on: { CLOSE: 'idle' }
          }
        }
      },
      fetchFailed: {
        on: { RETRY: 'fetchingProjects' }
      }
    }
  },
  {
    services: {
      fetchProjectsByOrg: () =>
        fetcher.get<OrgsResponse>(apiRoutes.orgs).then((response) => {
          // TODO: Support multiple orgs?
          // We're hardcoding the first one for now.
          const [firstOrg] = response.data.orgs;

          return fetcher(apiRoutes.getProjectsByOrg(firstOrg.id));
        })
    },
    actions: {
      setProjects: assign((context, event) => {
        const e = event as DoneInvokeEvent<ProjectsResponse>;

        return {
          projects: e.data.data.projects
        };
      }),
      setErrorMessage: assign((context, event) => {
        const e = event as DoneInvokeEvent<Error>;

        return {
          errorMessage: e.data.message
        };
      })
    }
  }
);
