import { Machine, assign, DoneInvokeEvent } from 'xstate';
import {
  Project,
  createEmptyProject,
  ProjectResponse,
  FindOneProjectParams
} from 'shared/interfaces/Project';
import { fetcher, FetcherResponse } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';

interface MachineContext {
  projectParams: FindOneProjectParams;
  project: Project;
  error: string;
}

export const initialContext: MachineContext = {
  projectParams: {
    orgName: '',
    projectKey: ''
  },
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
      viewingProject: {
        /*
          Init websocket now??
          
          User's FIRST issue must be made in FIRST column.
          The last column has a green checkmark

          Questions about uiSequence
          1: How is uiSequence determined——DB sorting, column map?
          2: If column map, it must be aware of any column changes.
            2.1: Add column, add entry into map. Who determines the new order, UI or server?
            2.2: Delete column, remove entry from map.
            2.3: Move column, update map.

          3. Would DB sorting be easier?
            3.1: No syncing needed.
            3.2: Is this fragile though?
                 All IO on Columns must be super-careful not to reorder anything.
                Perhaps column map is worth it...

        */
      },
      failed: {}
    }
  },
  {
    services: {
      fetchProject: ({ projectParams }) =>
        fetcher.get<ProjectResponse>(apiRoutes.findOneProject(projectParams))
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
