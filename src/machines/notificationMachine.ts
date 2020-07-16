import { Machine, assign } from 'xstate';
import { NotificationType } from 'shared/components/Notification/index';

interface MachineContext {
  message: string;
  notificationType: NotificationType;
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
  notificationType: NotificationType;
};
type Close = { type: 'CLOSE' };
type Pause = { type: 'PAUSE' };
type Resume = { type: 'RESUME' };
