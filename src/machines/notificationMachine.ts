import { Machine, assign, interpret } from 'xstate';
import { AppearanceTypes } from '@atlaskit/flag';

interface MachineContext {
  message: string;
  notificationType: AppearanceTypes;
}

type Event = Open | Close | Pause | Resume;

export const NotificationMachine = Machine<MachineContext, any, Event>(
  {
    id: 'notification',
    initial: 'closed',
    context: {
      message: '',
      notificationType: 'success'
    },
    on: {
      CLOSE: 'closed'
    },
    states: {
      closed: {
        on: {
          OPEN: {
            target: 'opened',
            actions: 'setTypeAndMessage'
          }
        }
      },
      opened: {
        on: {
          PAUSE: 'paused'
        },
        after: {
          3000: 'closed'
        }
      },
      paused: {
        on: {
          RESUME: 'opened'
        }
      }
    }
  },
  {
    actions: {
      setTypeAndMessage: assign((context, event) => {
        const { message, notificationType } = event as Open;

        return {
          message,
          notificationType
        };
      })
    }
  }
);

type Open = {
  type: 'OPEN';
  message: string;
  notificationType: AppearanceTypes;
};
type Close = { type: 'CLOSE' };
type Pause = { type: 'PAUSE' };
type Resume = { type: 'RESUME' };

// Globally available service
// to open notifications
export const notificationService = interpret(NotificationMachine).start();
