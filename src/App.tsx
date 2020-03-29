import React, { Fragment, createContext, useEffect, useContext } from 'react';
import { Login } from './screens/Login';
import { AnotherOne } from './screens/AnotherOne';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { assign, createMachine } from 'xstate';
import { useMachine } from '@xstate/react';
import { fetcher } from './fetcher';
import { CompleteSignup } from './screens/CompleteSignup';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthShell />
    </BrowserRouter>
  );
};

export interface User {
  googleId: string;
  firstName: null;
  lastName: null;
  email: string;
  dateJoined: string;
  profileImg: null;
  headerImg: null;
  jobTitle: null;
  department: null;
  organization: null;
  location: null;
}

enum States {
  pending = 'pending',
  success = 'success',
  fail = 'fail'
}

type AuthState =
  | {
      value: States.pending;
      context: AuthContext;
    }
  | {
      value: States.success;
      context: AuthContext;
    }
  | {
      value: States.fail;
      context: AuthContext;
    };

type AuthEvent =
  | { type: 'SUCCESS'; user: User }
  | { type: 'FAILED'; error: string }
  | { type: 'RETRY' };

interface AuthContext {
  user?: User;
  error: string;
}

// const authMachine = Machine<AuthContext, AuthStateSchema, AuthEvent>({
const authMachine = createMachine<AuthContext, AuthEvent, AuthState>({
  id: 'auth',
  context: {
    user: undefined,
    error: ''
  },
  initial: States.pending,
  states: {
    pending: {
      on: {
        SUCCESS: States.success,
        FAILED: States.fail
      },
      invoke: {
        src: () => fetcher('/api/user'),
        onDone: {
          target: States.success,
          actions: assign({
            user: (_, event) => event.data.data.user
          })
        },
        onError: {
          target: States.fail,
          actions: assign({
            error: (_, event) => event.data.message
          })
        }
      }
    },
    success: {},
    fail: {
      on: {
        RETRY: States.pending
      }
    }
  }
});

export const AuthContext = createContext<any>({});

const AuthShell = () => {
  const [current, send] = useMachine(authMachine);

  useEffect(() => {
    fetcher.interceptors.response.use(
      (res) => res,
      (error) => {
        send({
          type: 'FAILED',
          error: error.message
        });

        console.error(error);
        return error;
      }
    );
  }, [send]);

  const contextValue = {
    ...current.context,
    send
  };

  switch (current.value as States) {
    case States.pending:
      return <h1>Loading homie...</h1>;

    case States.success:
      return (
        <AuthContext.Provider value={contextValue}>
          <AuthenticatedApp />
        </AuthContext.Provider>
      );

    case States.fail:
      return (
        <AuthContext.Provider value={contextValue}>
          <UnauthenticatedApp />
        </AuthContext.Provider>
      );
  }
};

const UnauthenticatedApp = () => {
  return (
    <Fragment>
      <Redirect exact to="/login" />
      <Route exact path="/login">
        <Login />
      </Route>
    </Fragment>
  );
};

const AuthenticatedApp = () => {
  const { user } = useContext(AuthContext);
  const signupComplete = user.firstName && user.lastName;

  const nextRoute = signupComplete ? '/' : '/completeSignup';
  const NextComponent = signupComplete ? (
    <AnotherOne />
  ) : (
    <CompleteSignup user={user} />
  );

  return (
    <Fragment>
      <Redirect exact to={nextRoute} />
      <Route exact to={nextRoute}>
        {NextComponent}
      </Route>
    </Fragment>
  );
};
