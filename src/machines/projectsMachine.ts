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
            actions: 'spawnProjectsMachine'
          },
          onError: {
            target: 'fetchProjectsFailed',
            actions: 'updateErrorMessage'
          }
        }
      },
      viewingProjects: {},
      fetchProjectsFailed: {}
      // idle: {
      //   on: { CREATE_PROJECT: 'creatingProject' }
      // },
      // creatingProject: {
      //   on: { EXIT: 'idle' }
      // },
      // savingProject: {},
      // success: {},
      // failed: {}
    }
  },
  {
    services: {
      fetchProjects: (context, event) =>
        fetcher(apiRoutes.getProjectsByOrg(context.orgs[0].id))
    },
    actions: {
      updateErrorMessage: assign((context, event) => {
        const e = event as DoneInvokeEvent<Error>;

        return {
          errorMessage: e.data.message
        };
      })
    }
  }
);
