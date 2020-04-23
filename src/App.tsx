import React, { Fragment, useEffect } from 'react';
import { Login } from './screens/Login';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { useMachine } from '@xstate/react';
import { CompleteSignup } from './screens/CompleteSignup';
import { Notification } from 'shared/components/Notification';
import { authMachine } from 'machines/authMachine';
import { Dashboard } from 'screens/Dashboard';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthShell />
    </BrowserRouter>
  );
};

const AuthShell = () => {
  const [current, send] = useMachine(authMachine);

  useEffect(() => {
    send('TRY_AUTH');
  }, [send]);

  console.log('App.tsx', current);

  switch (true) {
    case current.matches('authenticating'):
      return <h1>Loading homie...</h1>;

    case current.matches('notSignedIn'):
    case current.matches('signinFailed'):
      return (
        <Fragment>
          <Redirect exact to="/login" />
          <Route exact path="/login">
            <Login send={send} />
          </Route>

          <Notification
            show={current.matches('signinFailed')}
            type="error"
            primaryMessage={current.context.error}
            secondaryMessage="Please try again"
            handleClose={() => send('CLEAR_ERROR')}
          />
        </Fragment>
      );

    case current.matches('awaitingSignup'):
      return (
        <CompleteSignup
          user={current.context.user}
          signupService={current.context.signupService}
        />
      );

    case current.matches('awaitingOrgConfirmation'):
      return <h1>Confirm yo org</h1>;

    case current.matches('appUsable'):
      return <AuthenticatedApp />;

    default:
      console.error('Default case hit!', current);
      return null;
  }
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
