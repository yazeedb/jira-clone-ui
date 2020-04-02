import { Machine, assign, spawn } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { signupMachine } from 'screens/CompleteSignup/signupMachine';

export interface User {
  googleId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateJoined: string;
  profileImg: string;
  headerImg: string;
  jobTitle: string;
  department: string;
  organization: string;
  location: string;
}

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

type AuthEvent =
  | { type: 'TRY_AUTH' }
  | { type: 'SUCCESS'; user: User }
  | { type: 'FAILED'; error: string }
  | { type: 'RETRY' }
  | { type: 'RESET' }
  | { type: 'SIGNUP_COMPLETE'; user: User };

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
        error: (_, event) => {
          return event.error;
        }
      })
    }
  },
  states: {
    idle: {
      on: { TRY_AUTH: AuthStates.pending }
    },
    pending: {
      on: {
        SUCCESS: AuthStates.success,
        FAILED: AuthStates.fail
      },
      invoke: {
        src: () => fetcher(apiRoutes.user),
        onDone: {
          target: AuthStates.success,
          actions: assign({
            user: (_, event) => event.data.data.user,
            signupMachineActor: (context) => {
              const machine =
                context.signupMachineActor || spawn(signupMachine);

              return machine;
            }
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
          actions: assign((context, event) => {
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
