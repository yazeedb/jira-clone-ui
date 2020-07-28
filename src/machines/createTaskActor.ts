import { Machine, assign, sendParent } from 'xstate';
import { FindOneColumnParams } from 'shared/interfaces/Project';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { notificationService } from './notificationMachine';

interface MachineContext {
  params: FindOneColumnParams;
  taskName: string;
  reporterId: string;
}

export const createTaskActor = Machine<MachineContext>(
  {
    initial: 'creating',
    states: {
      creating: {
        invoke: {
          src: 'createTask',
          onDone: {
            target: 'done'
          },
          onError: {
            target: 'done',
            actions: ['flashError', 'undoCreateTask']
          }
        }
      },
      done: { type: 'final' }
    }
  },
  {
    services: {
      createTask: ({ params, reporterId }) => {
        const { columnId, orgName, projectKey } = params;

        const url = apiRoutes.findOneColumn({
          columnId,
          orgName,
          projectKey
        });

        return fetcher.post(url, {
          name,
          reporterId,
          columnId
        });
      }
    },
    actions: {
      undoCreateTask: sendParent(({ params }: MachineContext) => {
        return {
          type: 'UNDO_CREATE_TASK',
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
