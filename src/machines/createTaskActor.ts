import { Machine, assign, sendParent } from 'xstate';
import { FindOneColumnParams } from 'shared/interfaces/Project';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { notificationService } from './notificationMachine';

interface MachineContext {
  params: FindOneColumnParams;
  taskName: string;
  taskTempId: string;
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
            target: 'done',
            actions: ['notifyParentSuccess']
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
      createTask: ({ params, reporterId, taskName }) => {
        const { columnId, orgName, projectKey } = params;

        const url = apiRoutes.findOneColumnTasks({
          columnId,
          orgName,
          projectKey
        });

        return fetcher.post(url, {
          name: taskName,
          reporterId,
          columnId
        });
      }
    },
    actions: {
      notifyParentSuccess: sendParent((context: MachineContext, event: any) => {
        return {
          ...event,
          type: 'CREATE_TASK_SUCCESS'
        };
      }),
      undoCreateTask: sendParent(({ params, taskTempId }: MachineContext) => {
        return {
          type: 'UNDO_CREATE_TASK',
          taskTempId,
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
