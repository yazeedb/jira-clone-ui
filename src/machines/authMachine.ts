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
    loggingIn: {};
    awaitingSignup: {};
    awaitingOrgConfirmation: {};
    appUsable: {};
  };
}

type AuthEvent =
  | { type: 'TRY_AUTH' }
  | { type: 'TRY_LOGIN'; idToken: string }
  | { type: 'SUCCESS'; user: User }
  | { type: 'ORG_CONFIRMED' }
  | { type: 'SIGNUP_COMPLETE'; user: User }
  | { type: 'SIGN_IN_FAILED'; data: { message: string } };

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
    initial: 'authenticating',
    on: {
      SIGN_IN_FAILED: {
        target: 'notSignedIn',
        actions: 'flashError'
      }
    },
    states: {
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
      notSignedIn: {
        on: {
          TRY_AUTH: 'authenticating',
          TRY_LOGIN: 'loggingIn'
        }
      },
      loggingIn: {
        invoke: {
          src: 'logUserIn',
          onDone: 'authenticating',
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

      logUserIn: (context, event) => {
        return fetcher.post(apiRoutes.login, {
          idToken: event.idToken
        });
      },

      kickUserIfEverUnauthenticated: () => (callback) => {
        fetcher.interceptors.response.use(
          (res) => res,
          (error) => {
            if (error.status === 401) {
              callback({
                type: 'SIGN_IN_FAILED',
                data: error
              });
            }

            return Promise.reject(error);
          }
        );
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
