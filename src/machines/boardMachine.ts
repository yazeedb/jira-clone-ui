import { Machine, assign, DoneInvokeEvent } from 'xstate';
import {
  Project,
  createEmptyProject,
  ProjectResponse,
  FindOneProjectParams,
  Column,
  ColumnsResponse
} from 'shared/interfaces/Project';
import { fetcher, FetcherResponse } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { isValidColumnLimit } from 'screens/Board/validateColumnLimit';
import { notificationService } from './notificationMachine';

interface MachineContext {
  projectParams: FindOneProjectParams;
  project: Project;
  error: string;
  selectedIssue?: string;
  pendingColumnId?: string;
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
  selectedIssue: undefined,
  pendingColumnId: undefined
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
            }
            // {
            //   target: 'viewingProject.fetchingIssue',
            //   actions: 'setProject',
            //   cond: 'hasSelectedIssue'
            // }
          ],
          onError: {
            target: 'failed',
            actions: 'setError'
          }
        }
      },
      failed: {},
      viewingProject: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              CHANGE_COLUMN_NAME: {
                target: 'changingColumnName',
                cond: 'isNewValue'
              },
              CREATE_COLUMN: 'creatingColumn',
              DELETE_COLUMN: {
                target: 'deletingColumn',
                cond: 'isNotLastColumn'
              },
              MOVE_COLUMN: 'movingColumn',
              SET_COLUMN_LIMIT: 'settingColumnLimit',
              CLEAR_COLUMN_LIMIT: 'clearingColumnLimit',
              CREATE_TASK: 'creatingTask',

              // Task actor events
              DELETE_TASK: 'pendingDeleteTask',
              RENAME_TASK: {
                target: 'idle',
                actions: 'spawnRenameTaskActor'
              },
              MOVE_TASK: {
                target: 'idle',
                actions: 'spawnMoveTaskActor'
              }
            }
          },
          pendingDeleteTask: {
            on: {
              CANCEL: 'idle',
              CONFIRM: {
                target: 'idle',
                actions: 'spawnDeleteTaskActor'
              }
            }
          },
          creatingTask: {
            initial: 'creating',
            onDone: 'idle',
            states: {
              creating: {
                invoke: {
                  src: 'createTask',
                  onDone: {
                    target: 'done',
                    actions: ['setColumns', 'spawnTaskActor']
                  },
                  onError: {
                    target: 'done',
                    actions: 'flashError'
                  }
                }
              },
              done: { type: 'final' }
            }
          },
          changingColumnName: {
            initial: 'saving',
            onDone: 'idle',
            states: {
              saving: {
                invoke: {
                  src: 'changeColumnName',
                  onDone: {
                    target: 'done',
                    actions: 'setColumns'
                  },
                  onError: {
                    target: 'done',
                    actions: 'flashError'
                  }
                }
              },
              done: { type: 'final' }
            }
          },
          creatingColumn: {
            initial: 'saving',
            onDone: 'idle',
            states: {
              saving: {
                invoke: {
                  src: 'createColumn',
                  onDone: {
                    target: 'done',
                    actions: 'setColumns'
                  },
                  onError: {
                    target: 'done',
                    actions: 'flashError'
                  }
                }
              },
              done: { type: 'final' }
            }
          },
          deletingColumn: {
            initial: 'awaiting',
            entry: 'setPendingColumnId',
            exit: 'resetPendingColumnId',
            onDone: 'idle',
            states: {
              awaiting: {
                on: {
                  CLOSE_DELETE_COLUMN: 'done',
                  CONFIRM_DELETE_COLUMN: 'saving'
                }
              },
              saving: {
                invoke: {
                  src: 'deleteColumn',
                  onDone: {
                    target: 'done',
                    actions: 'setColumns'
                  },
                  onError: {
                    target: 'done',
                    actions: 'flashError'
                  }
                }
              },
              done: { type: 'final' }
            }
          },
          movingColumn: {
            initial: 'saving',
            onDone: 'idle',
            states: {
              saving: {
                invoke: {
                  src: 'moveColumn',
                  onDone: {
                    target: 'done',
                    actions: 'setColumns'
                  },
                  onError: {
                    target: 'done',
                    actions: 'flashError'
                  }
                }
              },
              done: { type: 'final' }
            }
          },
          settingColumnLimit: {
            initial: 'awaiting',
            entry: 'setPendingColumnId',
            exit: 'resetPendingColumnId',
            onDone: 'idle',
            states: {
              awaiting: {
                on: {
                  CLOSE_COLUMN_LIMIT: 'done',
                  SUBMIT_COLUMN_LIMIT: {
                    target: 'saving',
                    cond: 'isValidColumnLimit'
                  }
                }
              },
              saving: {
                invoke: {
                  src: 'setColumnLimit',
                  onDone: {
                    target: 'done',
                    actions: 'setColumns'
                  },
                  onError: {
                    target: 'done',
                    actions: 'flashError'
                  }
                }
              },
              done: { type: 'final' }
            }
          },
          clearingColumnLimit: {
            initial: 'clearing',
            entry: 'setPendingColumnId',
            exit: 'resetPendingColumnId',
            onDone: 'idle',
            states: {
              clearing: {
                invoke: {
                  src: 'clearColumnLimit',
                  onDone: {
                    target: 'done',
                    actions: 'setColumns'
                  },
                  onError: {
                    target: 'done',
                    actions: 'flashError'
                  }
                }
              },
              done: { type: 'final' }
            }
          }
        }
      }
    }
  },
  {
    services: {
      createTask: (context, event) => {
        const { key, orgName } = context.project;
        const { name, reporterId, columnId } = event;

        const url = apiRoutes.findOneColumnTasks({
          columnId,
          orgName,
          projectKey: key
        });

        return fetcher.post(url, {
          name,
          reporterId,
          columnId
        });
      },

      fetchProject: ({ projectParams }) =>
        fetcher.get<ProjectResponse>(apiRoutes.findOneProject(projectParams)),

      changeColumnName: (context, event) => {
        const { id, newValue, projectKey, orgName } = event;
        const url = apiRoutes.findOneColumn({
          orgName,
          projectKey,
          columnId: id
        });

        return fetcher.put<ColumnsResponse>(url, { newValue });
      },

      createColumn: (context, event) => {
        const url = apiRoutes.columnsByProject({
          projectKey: context.project.key,
          orgName: context.project.orgName
        });

        return fetcher.post<ColumnsResponse>(url, { name: event.name });
      },
      deleteColumn: (context, event) => {
        if (!context.pendingColumnId) {
          return Promise.reject();
        }

        const url = apiRoutes.findOneColumn({
          projectKey: context.project.key,
          orgName: context.project.orgName,
          columnId: context.pendingColumnId
        });

        return fetcher.delete<ColumnsResponse>(url);
      },
      setColumnLimit: (context, event) => {
        if (!context.pendingColumnId) {
          return Promise.reject();
        }

        const { project, pendingColumnId } = context;
        const { limit } = event;

        const url = apiRoutes.setColumnLimit({
          projectKey: project.key,
          orgName: project.orgName,
          columnId: pendingColumnId
        });

        return fetcher.put<ColumnsResponse>(url, { limit });
      },
      clearColumnLimit: (context, event) => {
        if (!context.pendingColumnId) {
          return Promise.reject();
        }

        const { project, pendingColumnId } = context;

        const url = apiRoutes.setColumnLimit({
          projectKey: project.key,
          orgName: project.orgName,
          columnId: pendingColumnId
        });

        return fetcher.put<ColumnsResponse>(url, { limit: null });
      }
    },
    guards: {
      hasSelectedIssue: (context) => !!context.selectedIssue === true,
      noSelectedIssue: (context) => !!context.selectedIssue === false,

      isNewValue: (context, { oldValue, newValue }) =>
        oldValue.toLowerCase() !== newValue.toLowerCase(),

      isNotLastColumn: (context) => context.project.columns.length > 1,

      isValidColumnLimit: (context, { limit }) => isValidColumnLimit(limit)
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
      }),
      setColumns: assign({
        project: ({ project }, event) => {
          const e = event as DoneInvokeEvent<{ data: ColumnsResponse }>;

          return {
            ...project,
            columns: e.data.data.columns
          };
        }
      }),
      setPendingColumnId: assign({
        pendingColumnId: (context, event) => event.id
      }),
      resetPendingColumnId: assign({
        pendingColumnId: (context, event) => undefined
      }),
      flashError: assign((context, event) => {
        notificationService.send({
          type: 'OPEN',
          message: event.data.message,
          notificationType: 'warning'
        });

        return context;
      })
    }
  }
);

export const getTotalIssues = (columns: Column[]) =>
  columns.reduce((total, c) => total + c.tasks.length, 0);

/*
          Init websocket now??
          WS Events --
            Board-level events
              Client1 ====> updateBoard({ id: 1, newValue: 'Jenkins' })

              Server ====> notifyAllClients({
                type: 'BOARD_UPDATED',
                id: 1,
                diff: {
                  newValue: 'Jenkins',
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
