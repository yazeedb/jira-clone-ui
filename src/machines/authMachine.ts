import { Machine, assign, DoneInvokeEvent, spawn } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { signupMachine, SignupService } from './signupMachine';
import { User, createEmptyUser } from 'shared/interfaces/User';
import { confirmOrgMachine, ConfirmOrgService } from './confirmOrgMachine';

interface AuthStateSchema {
  states: {
    notSignedIn: {};
    signinFailed: {};
    authenticating: {};
    awaitingSignup: {};
    awaitingOrgConfirmation: {};
    appUsable: {};
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
  | { type: 'SIGN_IN_FAILED'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ORG_CONFIRMED' }
  | SignupCompleteEvent;

interface AuthContext {
  user: User;
  error: string;
  signupService: SignupService;
  confirmOrgService: ConfirmOrgService;
}

export const authMachine = Machine<AuthContext, AuthStateSchema, AuthEvent>(
  {
    id: 'auth',
    context: {
      user: createEmptyUser(),
      error: '',
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
            target: 'signinFailed',
            actions: assign({
              error: (_, event) => event.error
            })
          }
        }
      },
      signinFailed: {
        after: { 3000: 'notSignedIn' },
        on: {
          TRY_AUTH: 'authenticating',
          SIGN_IN_FAILED: {
            target: 'signinFailed',
            actions: assign({
              error: (_, event) => event.error
            })
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
            target: 'signinFailed',
            actions: 'updateErrorMessage'
          }
        }
      },
      awaitingSignup: {
        entry: 'spawnSignupService',
        on: { SIGNUP_COMPLETE: 'awaitingOrgConfirmation' }
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

        return userHasFullName(e.data);
      },
      signupNotComplete: (context, event) => {
        const e = event as AuthDoneEvent;

        return !userHasFullName(e.data);
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
      spawnSignupService: assign({
        signupService: () => spawn(signupMachine)
      }),
      spawnConfirmOrgService: assign({
        confirmOrgService: () => spawn(confirmOrgMachine)
      }),
      updateUser: assign({
        user: (_, event) => {
          const e = event as DoneInvokeEvent<AuthResponse>;

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

const userHasFullName = (user: User) => !!user.firstName && !!user.lastName;
type AuthDoneEvent = DoneInvokeEvent<User>;
interface AuthResponse {
  data: { user: User };
}
