import { Machine, assign, DoneInvokeEvent } from 'xstate';
import {
  Project,
  createEmptyProject,
  ProjectResponse,
  FindOneProjectParams,
  Column
} from 'shared/interfaces/Project';
import { fetcher, FetcherResponse } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';

interface MachineContext {
  projectParams: FindOneProjectParams;
  project: Project;
  error: string;
  selectedIssue?: string;
}

/*
  ======== Inside component ========
  const { selectedIssue } = parseQuery(useLocation().search)
  
  useMachine(boardMachine.withContext(selectedIssue))

  ======== Inside boardMachine ========
  fetching
    onDone: hasSelectedIssue ? 'fetchingIssue' : 'viewingProject'
    onError: failed

  viewingProject
    notSureYet

  fetchingIssue
    onDone: 'viewingIssue'
    onError: fetchIssueFail

  Multiple selected issues?
  1. Take first one
  2. Take last one

  ===== Enhancement? =====
  3. Tell user they picked 2+ tasks
    3.1 Have them pick one
*/

export const initialContext: MachineContext = {
  projectParams: {
    orgName: '',
    projectKey: ''
  },
  project: createEmptyProject(),
  error: '',
  selectedIssue: undefined
};

export const boardMachine = Machine<MachineContext>(
  {
    initial: 'fetching',
    context: initialContext,
    states: {
      fetching: {
        invoke: {
          src: 'fetchProject',
          onDone: [
            {
              target: 'viewingProject.idle',
              actions: 'setProject',
              cond: 'noSelectedIssue'
            },
            {
              target: 'viewingProject.fetchingIssue',
              actions: 'setProject',
              cond: 'hasSelectedIssue'
            }
          ],
          onError: {
            target: 'failed',
            actions: 'setError'
          }
        }
      },
      viewingProject: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              COLUMN_ORDER_UPDATED: { actions: 'reorderColumns' }
            }
          },
          fetchingIssue: {}
        }
        /*
          Init websocket now??
          WS Events --
            Board-level events
              Client1 ====> updateBoard({ id: 1, newName: 'Jenkins' })

              Server ====> notifyAllClients({
                type: 'BOARD_UPDATED',
                id: 1,
                diff: {
                  newName: 'Jenkins',
                  newOrder: 2,
                  newOwner: 'Afroze'
                }
              })
              
              Client2 ====> getBoard({id: 1 })
              
              Column-level events
              Server ====> { type: 'COLUMN_UPDATED', id: 1 }
              Client ====> getColumn({id: 1 })
              
              Task-level events
              Server ====> { type: 'TASK_UPDATED', id: 1 }
              Client ====> getTask({id: 1 })

          Are we missing any WS gotchas?
          Try building a small real-time piece as a PoC.

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
    guards: {
      hasSelectedIssue: (context) => !!context.selectedIssue === true,
      noSelectedIssue: (context) => !!context.selectedIssue === false
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
      }),
      reorderColumns: assign({
        project: (context, event) => {
          const { startIndex, endIndex } = event;
          const { columns } = context.project;

          const result = [...columns];
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);

          return {
            ...context.project,
            columns: result
          };
        }
      })
    }
  }
);

export const getTotalIssues = (columns: Column[]) =>
  columns.reduce((total, c) => total + c.tasks.length, 0);
