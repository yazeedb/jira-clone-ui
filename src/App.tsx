import React, { useState, Fragment, createContext, useEffect } from 'react';
import { Login } from './screens/Login/Login';
import { AnotherOne } from './screens/AnotherOne';
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
  useHistory
} from 'react-router-dom';
import { Machine } from 'xstate';
import { useMachine } from '@xstate/react';
import { fetcher } from './fetcher';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthShell />
    </BrowserRouter>
  );
};

const authMachine = Machine(
  {
    id: 'auth',
    context: {
      user: null,
      errorMessage: null
    },
    initial: 'loading',
    states: {
      loading: {
        on: {
          SUCCESS: 'success',
          FAILURE: 'failure'
        },
        invoke: {
          src: () => fetcher('/user'),
          onDone: {
            target: 'success',
            actions: 'setUser'
          },
          onError: {
            target: 'failure',
            actions: 'setError'
          }
        }
      },
      success: {
        on: {
          FAILURE: 'failure'
        }
      },
      failure: {
        on: {
          SUCCESS: 'success'
        }
      }
    }
  },
  {
    actions: {
      setUser: (context, event) => {
        return {
          ...context,
          user: event.data
        };
      },
      setError: (context, event) => {
        return {
          ...context,
          error: event.data
        };
      }
    }
  }
);

export const AuthContext = createContext<any>({});

const AuthShell = () => {
  const [current, send] = useMachine(authMachine);

  /*
        User goes to any URL, go into LOADING state.
        Make a call to /user to check if they're good.
        if SUCCESS
          go /home
        else if FAILURE
          go /login

        Then attach global HTTP interceptor
        If any future request fails due to 401,
          redirect to /login and flash "Unauthorized request. Please sign back in."
  */

  useEffect(() => {
    fetcher.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response.status === 401) {
          send('FAILURE');
        }
      }
    );
  });

  switch (current.value) {
    case 'loading':
      return <h1>Loading homie...</h1>;

    case 'success':
      return <AuthenticatedApp />;

    case 'failure':
      return <UnauthenticatedApp />;

    default:
      return (
        <h1>This should never render. Did you forget to include a case?</h1>
      );
  }
};

const UnauthenticatedApp = () => {
  return (
    <Fragment>
      <Route path="/login">
        <Login />
      </Route>

      <Redirect to="/login" />
    </Fragment>
  );
};

const AuthenticatedApp = () => {
  return (
    <Switch>
      <button
        onClick={() => {
          fetcher('/user').then(console.log);
        }}
      >
        Click me
      </button>
      <Route exact path="/">
        <AnotherOne />
      </Route>

      <Redirect to="/" />
    </Switch>
  );
};
