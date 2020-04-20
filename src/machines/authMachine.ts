import { Machine, assign, DoneInvokeEvent, spawn } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { signupMachine, SignupService } from './signupMachine';
import { User, createEmptyUser } from 'shared/interfaces/User';
import { confirmOrgMachine, ConfirmOrgService } from './confirmOrgMachine';
import { googleButtonId } from 'screens/Login';
import { initGoogleSignIn } from 'shared/initGoogleSignIn';

interface AuthStateSchema {
  states: {
    notSignedIn: {
      states: {
        idle: {};
        displayError: {};
      };
    };
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
  | { type: 'FAILED'; error: string }
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
    on: {
      TRY_AUTH: 'authenticating',
      FAILED: {
        target: 'notSignedIn.displayError',
        actions: assign({
          error: (_, event) => event.error
        })
      }
    },
    states: {
      notSignedIn: {
        initial: 'idle',
        invoke: { src: 'initGoogleSignIn' },
        states: {
          idle: {},
          displayError: {
            on: { CLEAR_ERROR: 'idle' },
            after: { 50000: 'idle' }
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
            target: 'notSignedIn.displayError',
            actions: 'updateErrorMessage'
          }
        },
        on: { TRY_AUTH: undefined }
      },
      awaitingSignup: {
        entry: assign({
          signupService: () => spawn(signupMachine)
        }),
        on: { SIGNUP_COMPLETE: 'awaitingOrgConfirmation' }
      },
      awaitingOrgConfirmation: {
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
      initGoogleSignIn: () => (callback) => {
        initGoogleSignIn(googleButtonId, callback);
      },
      authenticateUser: () => fetcher(apiRoutes.user),
      kickUserIfEverUnauthenticated: () => (callback) => {
        fetcher.interceptors.response.use(
          (res) => res,
          (error) => {
            if (error.response && error.response.status === 401) {
              callback({
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

const userHasFullName = (user: User) => !!user.firstName && !!user.lastName;
type AuthDoneEvent = DoneInvokeEvent<User>;
interface AuthResponse {
  data: { user: User };
}
