import React, { Fragment, createContext, useEffect } from 'react';
import { Login } from './screens/Login';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { useMachine } from '@xstate/react';
import { CompleteSignup } from './screens/CompleteSignup';
import { Notification } from 'shared/components/Notification';
import { authMachine, AuthStates } from 'machines/authMachine';
import { Dashboard } from 'screens/Dashboard';
import { User } from 'shared/interfaces/User';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthShell />
    </BrowserRouter>
  );
};

export const AuthContext = createContext<any>({});

const AuthShell = () => {
  const [current, send] = useMachine(authMachine);

  useEffect(() => {
    send('TRY_AUTH');
  }, [send]);

  const contextValue = {
    ...current.context,
    send
  };

  console.log('App.tsx', current);

  switch (current.value as AuthStates) {
    case AuthStates.authenticating:
      return <h1>Loading homie...</h1>;

    case AuthStates.awaitingSignup:
      return (
        <CompleteSignup
          user={current.context.user as User}
          // @ts-ignore
          signupService={current.context.signupService}
        />
      );

    case AuthStates.awaitingOrgConfirmation:
      return <h1>Confirm yo org</h1>;

    case AuthStates.appUsable:
      return (
        <AuthContext.Provider value={contextValue}>
          <AuthenticatedApp />
        </AuthContext.Provider>
      );

    case AuthStates.authFailed:
    case AuthStates.idle:
      return (
        <AuthContext.Provider value={contextValue}>
          <Notification
            type="error"
            primaryMessage={contextValue.error}
            secondaryMessage="Please try again"
            handleClose={() => {
              send('RETRY');
            }}
            show={current.matches(AuthStates.authFailed)}
          />

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
  return (
    <Fragment>
      <Redirect exact to="/" />
      <Route exact to="/">
        <Dashboard />
      </Route>
    </Fragment>
  );
};
