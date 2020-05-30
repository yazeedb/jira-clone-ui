import { Machine, assign, DoneInvokeEvent } from 'xstate';
import {
  Project,
  createEmptyProject,
  ProjectResponse
} from 'shared/interfaces/Project';
import { fetcher, FetcherResponse } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';

interface MachineContext {
  orgId: string;
  projectKey: string;
  project: Project;
  error: string;
}

export const initialContext: MachineContext = {
  orgId: '',
  projectKey: '',
  project: createEmptyProject(),
  error: ''
};

export const boardMachine = Machine<MachineContext>(
  {
    initial: 'fetching',
    context: initialContext,
    states: {
      fetching: {
        invoke: {
          src: 'fetchProject',
          onDone: {
            target: 'viewingProject',
            actions: 'setProject'
          },
          onError: {
            target: 'failed',
            actions: 'setError'
          }
        }
      },
      viewingProject: {},
      failed: {}
    }
  },
  {
    services: {
      fetchProject: ({ orgId, projectKey }) =>
        fetcher.get<ProjectResponse>(
          apiRoutes.findOneProject(orgId, projectKey)
        )
    },
    actions: {
      setProject: assign({
        project: (context, event) => {
          const e = event as DoneInvokeEvent<FetcherResponse<ProjectResponse>>;

          return e.data.data.project;
        }
      }),
      setError: assign({
        error: (context, event) => {
          const e = event as DoneInvokeEvent<Error>;

          return e.data.message;
        }
      })
    }
  }
);
