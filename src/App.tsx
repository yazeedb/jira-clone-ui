import React, { Fragment, useEffect } from 'react';
import { Login } from './screens/Login';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { useMachine } from '@xstate/react';
import { CompleteSignup } from './screens/CompleteSignup';
import { Notification } from 'shared/components/Notification';
import { authMachine } from 'machines/authMachine';
import { Dashboard } from 'screens/Dashboard';
import { ConfirmOrg } from 'screens/ConfirmOrg';
import { GlobalNav } from 'shared/components/GlobalNav';

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
          <Login send={send} />

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
        <Fragment>
          <Redirect exact to="/completeSignup" />

          <CompleteSignup
            user={current.context.user}
            signupService={current.context.signupService}
          />
        </Fragment>
      );

    case current.matches('awaitingOrgConfirmation'):
      return (
        <Fragment>
          <Redirect exact to="/confirmOrg" />

          <ConfirmOrg
            confirmOrgService={current.context.confirmOrgService}
            user={current.context.user}
          />
        </Fragment>
      );

    case current.matches('appUsable'):
      return <AuthenticatedApp />;

    default:
      console.error('Default case hit!', current);
      return null;
  }
};

const AuthenticatedApp = () => {
  return (
    <div className="authenticated-app">
      <GlobalNav />
      <Redirect exact to="/dashboard" />
      <Route exact to="/">
        <Dashboard />
      </Route>
    </div>
  );
};
