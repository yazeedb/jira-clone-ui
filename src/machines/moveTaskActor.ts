import { Machine, assign, sendParent } from 'xstate';
import { FindOneColumnParams } from 'shared/interfaces/Project';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { notificationService } from './notificationMachine';
import { DndParams } from './boardMachine';

interface MachineContext {
  params: FindOneColumnParams;
  dndParams: DndParams;
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
      moveTask: ({ params, dndParams }) =>
        fetcher.put(apiRoutes.moveTask(params), dndParams)
    },
    actions: {
      undoMoveTask: sendParent(({ params, dndParams }: MachineContext) => {
        return {
          type: 'UNDO_MOVE_TASK',
          params,
          dndParams
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
