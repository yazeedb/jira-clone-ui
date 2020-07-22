import { Machine, assign, DoneInvokeEvent, spawn } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { signupMachine, SignupService } from './signupMachine';
import { User, createEmptyUser } from 'shared/interfaces/User';
import { confirmOrgMachine, ConfirmOrgService } from './confirmOrgMachine';
import { notificationService } from './notificationMachine';

interface AuthStateSchema {
  states: {
    notSignedIn: {};
    authenticating: {};
    awaitingSignup: {};
    awaitingOrgConfirmation: {};
    appUsable: {};
  };
}

type AuthEvent =
  | { type: 'TRY_AUTH' }
  | { type: 'SUCCESS'; user: User }
  | { type: 'SIGN_IN_FAILED'; error: string }
  | { type: 'ORG_CONFIRMED' }
  | { type: 'SIGNUP_COMPLETE'; user: User };

interface AuthContext {
  user: User;
  signupService: SignupService;
  confirmOrgService: ConfirmOrgService;
}

export const authMachine = Machine<AuthContext, AuthStateSchema, AuthEvent>(
  {
    id: 'auth',
    context: {
      user: createEmptyUser(),
      signupService: spawn(signupMachine),
      confirmOrgService: spawn(confirmOrgMachine)
    },
    invoke: { src: 'kickUserIfEverUnauthenticated' },
    initial: 'notSignedIn',
    states: {
      notSignedIn: {
        on: {
          TRY_AUTH: 'authenticating',
          SIGN_IN_FAILED: {
            target: 'notSignedIn',
            actions: 'flashError'
          }
        }
      },
      authenticating: {
        invoke: {
          src: 'authenticateUser',
          onDone: [
            {
              target: 'awaitingOrgConfirmation',
              actions: 'updateUser',
              cond: 'signupComplete'
            },
            {
              target: 'awaitingSignup',
              actions: 'updateUser',
              cond: 'signupNotComplete'
            }
          ],
          onError: {
            target: 'notSignedIn',
            actions: 'flashError'
          }
        }
      },
      awaitingSignup: {
        entry: 'spawnSignupService',
        on: {
          SIGNUP_COMPLETE: {
            target: 'awaitingOrgConfirmation',
            actions: assign({
              user: (context, event) => {
                console.log('SIGNUP_COMPLETE RAN', { context, event });

                return event.user;
              }
            })
          }
        }
      },
      awaitingOrgConfirmation: {
        entry: 'spawnConfirmOrgService',
        on: { ORG_CONFIRMED: 'appUsable' }
      },
      appUsable: {}
    }
  },
  {
    guards: {
      signupComplete: (context, event) => {
        const e = event as AuthDoneEvent;

        return userHasFullName(e.data.data.user);
      },
      signupNotComplete: (context, event) => {
        const e = event as AuthDoneEvent;

        return !userHasFullName(e.data.data.user);
      }
    },
    services: {
      authenticateUser: () => fetcher(apiRoutes.user),
      kickUserIfEverUnauthenticated: () => (callback) => {
        console.log('401 logic set up');
        fetcher.interceptors.response.use(
          (res) => res,
          (error) => {
            if (error.response && error.response.status === 401) {
              callback({
                type: 'SIGN_IN_FAILED',
                error: error.message
              });
            }

            return Promise.reject(error);
          }
        );

        return () => {
          console.log('401 logic cleaned up');
        };
      }
    },
    actions: {
      flashError: assign((context, event) => {
        const e = event as DoneInvokeEvent<Error>;

        notificationService.send({
          type: 'OPEN',
          message: e.data.message,
          notificationType: 'error'
        });

        return context;
      }),
      spawnSignupService: assign({
        signupService: (context, event) => spawn(signupMachine)
      }),
      spawnConfirmOrgService: assign({
        confirmOrgService: (context, event) => spawn(confirmOrgMachine)
      }),
      updateUser: assign({
        user: (context, event) => {
          const e = event as DoneInvokeEvent<AuthResponse>;

          return e.data.data.user;
        }
      })
    }
  }
);

const userHasFullName = (user: User) => !!user.firstName && !!user.lastName;
type AuthDoneEvent = DoneInvokeEvent<AuthResponse>;
interface AuthResponse {
  data: { user: User };
}
