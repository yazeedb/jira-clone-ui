import { Machine, assign, spawn } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { signupMachine } from 'screens/CompleteSignup/signupMachine';
import { User } from 'shared/interfaces/User';

export enum AuthStates {
  idle = 'idle',
  pending = 'pending',
  success = 'success',
  fail = 'fail'
}

interface AuthStateSchema {
  states: {
    [AuthStates.idle]: {};
    [AuthStates.pending]: {};
    [AuthStates.success]: {};
    [AuthStates.fail]: {};
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
  | { type: 'RESET' }
  | SignupCompleteEvent;

interface AuthContext {
  signupMachineActor?: any;
  user?: User;
  error: string;
}

export const authMachine = Machine<AuthContext, AuthStateSchema, AuthEvent>({
  id: 'auth',
  context: {
    user: undefined,
    error: '',
    signupMachineActor: null
  },
  initial: AuthStates.idle,
  on: {
    FAILED: {
      target: AuthStates.fail,
      actions: assign({
        error: (_, event) => event.error
      })
    }
  },
  states: {
    idle: {
      on: { TRY_AUTH: AuthStates.pending }
    },
    pending: {
      invoke: {
        src: () => fetcher(apiRoutes.user),
        onDone: {
          target: AuthStates.success,
          actions: assign({
            user: (_, event) => event.data.data.user,
            signupMachineActor: (context) =>
              context.signupMachineActor || spawn(signupMachine)
          })
        },
        onError: {
          target: AuthStates.fail,
          actions: assign({
            error: (_, event) => event.data.message
          })
        }
      }
    },
    success: {
      on: {
        SIGNUP_COMPLETE: {
          actions: assign((_, event) => {
            return {
              user: event.user
            };
          })
        }
      }
    },
    fail: {
      on: {
        RETRY: AuthStates.pending,
        RESET: AuthStates.idle
      },
      after: { 5000: AuthStates.idle }
    }
  }
});
