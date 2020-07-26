import { Machine, assign, sendParent } from 'xstate';
import { FindOneTaskParams, Task } from 'shared/interfaces/Project';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { notificationService } from './notificationMachine';

interface MachineContext {
  params: FindOneTaskParams;
  oldTask: Task;
}

export const deleteTaskActor = Machine<MachineContext>(
  {
    initial: 'saving',
    states: {
      saving: {
        invoke: {
          src: 'deleteTask',
          onDone: {
            target: 'done'
          },
          onError: {
            target: 'done',
            actions: ['flashError', 'undoDeleteTask']
          }
        }
      },
      done: { type: 'final' }
    }
  },
  {
    services: {
      deleteTask: ({ params }) => fetcher.delete(apiRoutes.findOneTask(params))
    },
    actions: {
      undoDeleteTask: sendParent(({ params, oldTask }: MachineContext) => {
        return {
          type: 'UNDO_DELETE_TASK',
          oldTask,
          columnId: params.columnId
        };
      }),
      flashError: assign((context, event) => {
        notificationService.send({
          type: 'OPEN',
          notificationType: 'error',
          message: event.data.message
        });

        return context;
      })
    }
  }
);
