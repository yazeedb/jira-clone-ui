import { Machine, assign, DoneInvokeEvent, Interpreter } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { Org } from 'shared/interfaces/Org';
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
          src: 'fetchProjects',
          onDone: {
            target: 'viewingProjects',
            actions: 'setProjects'
          },
          onError: {
            target: 'fetchProjectsFailed',
            actions: 'updateErrorMessage'
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
      fetchProjectsFailed: {
        on: { RETRY: 'fetchingProjects' }
      }
    }
  },
  {
    services: {
      fetchProjects: (context, event) =>
        fetcher(apiRoutes.getProjectsByOrg(context.orgs[0].id))
    },
    actions: {
      setProjects: assign((context, event) => {
        const e = event as DoneInvokeEvent<ProjectsResponse>;

        return {
          projects: e.data.data.projects
        };
      }),
      updateErrorMessage: assign((context, event) => {
        const e = event as DoneInvokeEvent<Error>;

        return {
          errorMessage: e.data.message
        };
      })
    }
  }
);
