import { Machine, assign, sendParent } from 'xstate';
import { Task, MoveTaskParams } from 'shared/interfaces/Project';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { notificationService } from './notificationMachine';

interface MachineContext {
  params: MoveTaskParams;
}

export const moveTaskActor = Machine<MachineContext>(
  {
    initial: 'saving',
    states: {
      saving: {
        invoke: {
          src: 'moveTask',
          onDone: {
            target: 'done'
          },
          onError: {
            target: 'done',
            actions: ['flashError', 'undoMoveTask']
          }
        }
      },
      done: { type: 'final' }
    }
  },
  {
    services: {
      moveTask: ({ params }) => fetcher.put(apiRoutes.moveTask(params), params)
    },
    actions: {
      undoMoveTask: sendParent(({ params }: MachineContext) => {
        return {
          ...params,
          type: 'UNDO_MOVE_TASK'
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
