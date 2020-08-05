import { Machine, assign, DoneInvokeEvent, Interpreter, spawn } from 'xstate';
import {
  Project,
  createEmptyProject,
  ProjectResponse,
  FindOneProjectParams,
  Column,
  ColumnsResponse,
  Task,
  createPendingTask
} from 'shared/interfaces/Project';
import { v4 as uuid } from 'uuid';
import { fetcher, FetcherResponse } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { isValidColumnLimit } from 'screens/Board/validateColumnLimit';
import { notificationService } from './notificationMachine';
import { deleteTaskActor } from './deleteTaskActor';
import { createTaskActor } from './createTaskActor';
import { moveTaskActor } from './moveTaskActor';
import { DraggableLocation } from 'react-beautiful-dnd';

export interface DndParams {
  source: DraggableLocation;
  destination: DraggableLocation;
  draggableId: string;
}

interface MachineContext {
  projectParams: FindOneProjectParams;
  project: Project;
  error: string;
  selectedIssue?: string;
  pendingColumn?: Column;
  pendingTask?: Task;
  taskActorMap: Map<string, Interpreter<any>>;

  // TODO: Is this the best
  // way to store MOVE_COLUMN indices?
  // Needed for rollback.
  dndParams: DndParams;
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
  pendingColumn: undefined,
  pendingTask: undefined,
  taskActorMap: new Map(),

  // Mock initial values
  // to appease TypeScript
  dndParams: {
    source: {
      droppableId: '',
      index: -1
    },
    destination: {
      droppableId: '',
      index: -1
    },
    draggableId: ''
  }
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
              MOVE_COLUMN: {
                target: 'movingColumn',
                actions: [
                  'setPendingColumn',
                  'setDndParams',
                  'optimisticallyMoveColumn'
                ]
              },
              SET_COLUMN_LIMIT: 'settingColumnLimit',
              CLEAR_COLUMN_LIMIT: 'clearingColumnLimit',

              // Task actor events
              CREATE_TASK: {
                target: 'idle',
                actions: [
                  'setPendingColumn',
                  'setPendingTask',
                  'createPendingTaskAndActor'
                ]
              },
              CREATE_TASK_SUCCESS: {
                target: 'idle',
                actions: 'setColumns'
              },
              UNDO_CREATE_TASK: {
                target: 'idle',
                actions: 'undoCreateTask'
              },

              DELETE_TASK: {
                target: 'pendingDeleteTask',
                actions: ['setPendingColumn', 'setPendingTask']
              },

              MOVE_TASK: {
                target: 'idle',
                actions: [
                  'setDndParams',
                  'optimisticallyMoveTask',
                  'spawnMoveTaskActor'
                ]
              },
              UNDO_MOVE_TASK: {
                target: 'idle',
                actions: 'undoMoveTask'
              },
              MOVE_TASK_SUCCESS: {
                target: 'idle',
                actions: 'setColumns'
              },

              // Undo optimistic update events
              UNDO_DELETE_TASK: {
                target: 'idle',
                actions: 'undoDeleteTask'
              }
            }
          },
          pendingDeleteTask: {
            on: {
              CANCEL: 'idle',
              CONFIRM: {
                target: 'idle',
                actions: ['spawnDeleteTaskActor', 'optimisticallyDeleteTask']
              }
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
            entry: 'setPendingColumn',
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
                    actions: ['flashError', 'undoMoveColumn']
                  }
                }
              },
              done: { type: 'final' }
            }
          },
          settingColumnLimit: {
            initial: 'awaiting',
            entry: 'setPendingColumn',
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
            entry: 'setPendingColumn',
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
      moveColumn: ({ project, pendingColumn, dndParams }) => {
        if (!pendingColumn) {
          return Promise.reject();
        }

        return fetcher.put(
          apiRoutes.moveColumn({
            columnId: pendingColumn.id,
            orgName: project.orgName,
            projectKey: project.key
          }),
          dndParams
        );
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
        if (!context.pendingColumn) {
          return Promise.reject();
        }

        const url = apiRoutes.findOneColumn({
          projectKey: context.project.key,
          orgName: context.project.orgName,
          columnId: context.pendingColumn.id
        });

        return fetcher.delete<ColumnsResponse>(url);
      },
      setColumnLimit: (context, event) => {
        if (!context.pendingColumn) {
          return Promise.reject();
        }

        const { project, pendingColumn } = context;
        const { limit } = event;

        const url = apiRoutes.setColumnLimit({
          projectKey: project.key,
          orgName: project.orgName,
          columnId: pendingColumn.id
        });

        return fetcher.put<ColumnsResponse>(url, { limit });
      },
      clearColumnLimit: (context, event) => {
        if (!context.pendingColumn) {
          return Promise.reject();
        }

        const { project, pendingColumn } = context;

        const url = apiRoutes.setColumnLimit({
          projectKey: project.key,
          orgName: project.orgName,
          columnId: pendingColumn.id
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
      optimisticallyMoveColumn: assign({
        project: ({ project, pendingColumn, dndParams }) => {
          if (!pendingColumn) {
            return project;
          }

          const { columns } = project;
          const { source, destination } = dndParams;

          columns.splice(source.index, 1);
          columns.splice(destination.index, 0, pendingColumn);

          return {
            ...project,
            columns
          };
        }
      }),
      undoMoveColumn: assign({
        project: ({ project, pendingColumn, dndParams }) => {
          if (!pendingColumn) {
            return project;
          }

          const { columns } = project;
          const { source, destination } = dndParams;

          // Do the same thing,
          // but in reverse
          columns.splice(destination.index, 1);
          columns.splice(source.index, 0, pendingColumn);

          return {
            ...project,
            columns
          };
        }
      }),
      spawnMoveTaskActor: assign({
        taskActorMap: ({ project, taskActorMap, dndParams }) => {
          const actor = spawn(
            moveTaskActor.withContext({
              dndParams,
              params: {
                orgName: project.orgName,
                projectKey: project.key,
                columnId: dndParams.source.droppableId
              }
            })
          );

          taskActorMap.set(dndParams.draggableId, actor);

          return taskActorMap;
        }
      }),
      optimisticallyMoveTask: assign({
        project: ({ project, dndParams }) => moveTasks(dndParams, project)
      }),
      undoMoveTask: assign({
        project: ({ project }, { dndParams }) =>
          moveTasks(
            {
              source: dndParams.destination,
              destination: dndParams.source,
              draggableId: dndParams.draggableId
            },
            project
          )
      }),
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

      // Pending column/task actions
      setPendingColumn: assign({
        pendingColumn: (context, event) => event.column
      }),
      setPendingTask: assign({
        pendingTask: (context, event) => event.task
      }),
      setDndParams: assign({
        dndParams: (context, { source, destination, draggableId }) => ({
          source,
          destination,
          draggableId
        })
      }),

      createPendingTaskAndActor: assign(
        ({ project, taskActorMap }, { name, columnId, reporterId }) => {
          // The pending task + actor work is combined
          // because taskActorMap needs the temp UUID
          const pendingTaskId = uuid();

          const actor = spawn(
            createTaskActor.withContext({
              params: {
                columnId,
                orgName: project.orgName,
                projectKey: project.key
              },
              reporterId,
              taskName: name,
              taskTempId: pendingTaskId
            })
          );

          taskActorMap.set(pendingTaskId, actor);

          return {
            taskActorMap,
            project: {
              ...project,
              columns: project.columns.map((c) => {
                if (c.id !== columnId) {
                  return c;
                }

                const newPendingTask = createPendingTask(pendingTaskId, name);

                return {
                  ...c,
                  tasks: [...c.tasks, newPendingTask]
                };
              })
            }
          };
        }
      ),
      undoCreateTask: assign({
        project: ({ project }, { columnId, taskTempId }) => {
          return {
            ...project,
            columns: project.columns.map((c) =>
              c.id !== columnId
                ? c
                : {
                    ...c,
                    tasks: c.tasks.filter((t) => t.id !== taskTempId)
                  }
            )
          };
        }
      }),

      // Rename task actions
      undoDeleteTask: assign({
        project: ({ project }, { oldTask }) => {
          return {
            ...project,
            columns: setPendingDeleteTask(false, oldTask.id, project.columns)
          };
        }
      }),
      optimisticallyDeleteTask: assign({
        project: ({ project, pendingTask }) => {
          if (!pendingTask) {
            return project;
          }

          return {
            ...project,
            columns: setPendingDeleteTask(true, pendingTask.id, project.columns)
          };
        }
      }),
      spawnDeleteTaskActor: assign({
        taskActorMap: ({
          projectParams,
          taskActorMap,
          pendingColumn,
          pendingTask
        }) => {
          if (!pendingColumn || !pendingTask) {
            return taskActorMap;
          }

          const actor = spawn(
            deleteTaskActor.withContext({
              params: {
                orgName: projectParams.orgName,
                projectKey: projectParams.projectKey,
                columnId: pendingColumn.id,
                taskId: pendingTask.id
              },
              oldTask: pendingTask
            })
          );

          taskActorMap.set(pendingTask.id, actor);

          return taskActorMap;
        }
      }),
      // Flash error notifications
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
  columns.reduce((total, c) => {
    const visibleTasks = c.tasks.filter((t) => !t.pendingDelete);

    return total + visibleTasks.length;
  }, 0);

const setPendingDeleteTask = (
  pendingDelete: boolean,
  taskId: string,
  columns: Column[]
): Column[] =>
  columns.map((c) => ({
    ...c,
    tasks: c.tasks.map((t) =>
      t.id !== taskId
        ? t
        : {
            ...t,
            pendingDelete
          }
    )
  }));

const moveTasks = (dndParams: DndParams, project: Project) => {
  const { source, destination, draggableId } = dndParams;
  const { columns } = project;

  const startColumn = columns.find((c) => c.id === source.droppableId);

  const finishColumn = columns.find((c) => c.id === destination.droppableId);

  if (!startColumn || !finishColumn) {
    return project;
  }

  const task = startColumn.tasks.find((t) => t.id === draggableId);

  if (!task) {
    return project;
  }

  if (startColumn.id === finishColumn.id) {
    startColumn.tasks.splice(source.index, 1);
    finishColumn.tasks.splice(destination.index, 0, task);
  } else {
    startColumn.tasks.splice(source.index, 1);
    finishColumn.tasks.splice(destination.index, 0, task);
  }

  return project;
};

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
