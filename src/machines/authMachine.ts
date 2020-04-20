import { Machine, assign, DoneInvokeEvent, spawn, Interpreter } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { signupMachine } from './signupMachine';
import { User } from 'shared/interfaces/User';
import { confirmOrgMachine } from './confirmOrgMachine';

export enum AuthStates {
  idle = 'idle',
  authenticating = 'authenticating',
  authFailed = 'authFailed',
  awaitingSignup = 'awaitingSignup',
  awaitingOrgConfirmation = 'awaitingOrgConfirmation',
  appUsable = 'appUsable'
}

interface AuthStateSchema {
  states: {
    [AuthStates.idle]: {};
    [AuthStates.authenticating]: {};
    [AuthStates.authFailed]: {};
    [AuthStates.awaitingSignup]: {};
    [AuthStates.awaitingOrgConfirmation]: {};
    [AuthStates.appUsable]: {};
  };
}

export type SignupCompleteEvent = {
  type: 'SIGNUP_COMPLETE';
  user: User;
};

// For signupMachine, when user completes their signup.
export const createSignupCompleteEvent = (user: User): SignupCompleteEvent => {
  return {
    type: 'SIGNUP_COMPLETE',
    user
  };
};

type AuthEvent =
  | { type: 'TRY_AUTH' }
  | { type: 'SUCCESS'; user: User }
  | { type: 'FAILED'; error: string }
  | { type: 'RETRY' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ORG_CONFIRMED' }
  | SignupCompleteEvent;

interface AuthContext {
  user?: User;
  error: string;
  signupService?: Interpreter<any, any, any>;
  confirmOrgService?: Interpreter<any, any, any>;
}

export const authMachine = Machine<AuthContext, AuthStateSchema, AuthEvent>(
  {
    id: 'auth',
    context: {
      user: undefined,
      error: '',
      signupService: undefined,
      confirmOrgService: undefined
    },
    invoke: { src: 'kickUserIfEverUnauthenticated' },
    initial: AuthStates.idle,
    on: {
      FAILED: {
        target: AuthStates.authFailed,
        actions: assign({
          error: (_, event) => event.error
        })
      }
    },
    states: {
      idle: {
        on: { TRY_AUTH: AuthStates.authenticating }
      },
      authenticating: {
        invoke: {
          src: 'authenticateUser',
          onDone: [
            {
              target: AuthStates.awaitingOrgConfirmation,
              actions: 'updateUser',
              cond: 'signupComplete'
            },
            {
              target: AuthStates.awaitingSignup,
              actions: 'updateUser',
              cond: 'signupNotComplete'
            }
          ],
          onError: {
            target: AuthStates.authFailed,
            actions: 'updateErrorMessage'
          }
        }
      },
      authFailed: {
        on: {
          RETRY: AuthStates.authenticating,
          CLEAR_ERROR: AuthStates.idle
        },
        after: { 5000: AuthStates.idle }
      },
      awaitingSignup: {
        entry: assign({
          signupService: (context) =>
            context.signupService || spawn(signupMachine)
        }),
        on: { SIGNUP_COMPLETE: AuthStates.awaitingOrgConfirmation }
      },
      awaitingOrgConfirmation: {
        entry: assign({
          confirmOrgService: (context) =>
            context.confirmOrgService || spawn(confirmOrgMachine)
        }),
        on: { ORG_CONFIRMED: AuthStates.appUsable }
      },
      appUsable: {}
    }
  },
  {
    guards: {
      signupComplete: (context, event) => {
        const e = event as AuthDoneEvent;

        return userHasFullName(e.data);
      },
      signupNotComplete: (context, event) => {
        const e = event as AuthDoneEvent;

        return !userHasFullName(e.data);
      }
    },
    services: {
      authenticateUser: () => fetcher(apiRoutes.user),
      kickUserIfEverUnauthenticated: () => (cb) => {
        fetcher.interceptors.response.use(
          (res) => res,
          (error) => {
            if (error.response && error.response.status === 401) {
              cb({
                type: 'FAILED',
                error: error.message
              });
            }

            return Promise.reject(error);
          }
        );
      }
    },
    actions: {
      updateUser: assign({
        user: (_, event) => {
          const e = event as DoneInvokeEvent<AuthResponse>;
          console.log(e);

          return e.data.data.user;
        }
      }),
      updateErrorMessage: assign({
        error: (_, event) => {
          const e = event as DoneInvokeEvent<Error>;

          return e.data.message;
        }
      })
    }
  }
);

type AuthDoneEvent = DoneInvokeEvent<User>;
interface AuthResponse {
  data: { user: User };
}

const userHasFullName = (user: User) => !!user.firstName && !!user.lastName;
