import { Machine, sendParent } from 'xstate';
import { FindOneTaskParams } from 'shared/interfaces/Project';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';

interface MachineContext {
  params: FindOneTaskParams;
  oldTaskname: string;
  newTaskName: string;
}

export const renameTaskActor = Machine<MachineContext>(
  {
    initial: 'saving',
    states: {
      saving: {
        invoke: {
          src: 'changeColumnName',
          onDone: {
            target: 'done'
          },
          onError: {
            target: 'done',
            actions: ['flashError', 'rollbackChangeName']
          }
        }
      },
      done: { type: 'final' }
    }
  },
  {
    services: {
      changeColumnName: ({ newTaskName, params }) =>
        fetcher.put(apiRoutes.renameTask(params), {
          newTaskName
        })
    },
    actions: {
      rollbackChangeName: sendParent(
        ({ params, oldTaskname }: MachineContext) => ({
          type: 'ROLLBACK_CHANGE_NAME',
          oldTaskname,
          taskId: params.taskId,
          columnId: params.columnId
        })
      )
    }
  }
);
