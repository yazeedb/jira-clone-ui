import React, { Fragment, createContext, useEffect, useContext } from 'react';
import { Login } from './screens/Login';
import { AnotherOne } from './screens/AnotherOne';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { assign, Machine } from 'xstate';
import { useMachine } from '@xstate/react';
import { fetcher } from './fetcher';
import { CompleteSignup } from './screens/CompleteSignup';
import { Notification } from 'shared/components/Notification';

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
  idle = 'idle',
  pending = 'pending',
  success = 'success',
  fail = 'fail'
}

interface AuthStateSchema {
  states: {
    [States.idle]: {};
    [States.pending]: {};
    [States.success]: {};
    [States.fail]: {};
  };
}

type AuthEvent =
  | { type: 'TRY_AUTH' }
  | { type: 'SUCCESS'; user: User }
  | { type: 'FAILED'; error: string }
  | { type: 'RETRY' }
  | { type: 'RESET' };

interface AuthContext {
  user?: User;
  error: string;
}

const authMachine = Machine<AuthContext, AuthStateSchema, AuthEvent>({
  id: 'auth',
  context: {
    user: undefined,
    error: ''
  },
  initial: States.pending,
  on: {
    FAILED: {
      target: States.fail,
      actions: assign({
        error: (_, event) => {
          return event.error;
        }
      })
    }
  },
  states: {
    idle: {
      on: { TRY_AUTH: 'pending' }
    },
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
        RETRY: States.pending,
        RESET: States.idle
      },
      after: { 5000: States.idle }
    }
  }
});

export const AuthContext = createContext<any>({});

const AuthShell = () => {
  const [current, send] = useMachine(authMachine);

  console.log(current);

  useEffect(() => {
    fetcher.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response && error.response.status === 401) {
          send({
            type: 'FAILED',
            error: error.message
          });
        }
        return Promise.reject(error);
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
    case States.idle:
      return (
        <AuthContext.Provider value={contextValue}>
          {current.matches(States.fail) && (
            <Notification
              type="error"
              primaryMessage={contextValue.error}
              secondaryMessage="Please try again"
              handleClose={() => {
                send('RESET');
              }}
            />
          )}
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
