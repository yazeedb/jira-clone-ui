import React, { useEffect } from 'react';
import { Login } from './screens/Login';
import {
  BrowserRouter,
  Route,
  Switch,
  useHistory,
  Redirect
} from 'react-router-dom';
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
  console.log('App.tsx', current);

  useEffect(() => {
    send('TRY_AUTH');
  }, [send]);

  const history = useHistory();
  useEffect(() => {
    if (current.value === 'appUsable') {
      history.push('/projects');
      // TODO: What if user's trying to go somewhere else?
      // Recall that URL, and send them there instead.
      // Don't just blindly send to /projects
    }
  }, [current.value, history]);

  switch (true) {
    case current.matches('notSignedIn'):
    case current.matches('signinFailed'):
    case current.matches('authenticating'):
      return (
        <>
          <Redirect to="/login" />
          <Login loading={current.matches('authenticating')} send={send} />

          <Notification
            show={current.matches('signinFailed')}
            type="error"
            primaryMessage={current.context.error}
            secondaryMessage="Please try again"
            handleClose={() => send('CLEAR_ERROR')}
          />
        </>
      );

    case current.matches('awaitingSignup'):
      return (
        <>
          <Redirect to="/completeSignup" />
          <CompleteSignup
            user={current.context.user}
            signupService={current.context.signupService}
          />
        </>
      );

    case current.matches('awaitingOrgConfirmation'):
      return (
        <>
          <Redirect to="/confirmOrg" />
          <ConfirmOrg
            confirmOrgService={current.context.confirmOrgService}
            user={current.context.user}
          />
        </>
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
      <Switch>
        <Route path="/">
          <GlobalNav />
          <Dashboard />
        </Route>

        <Route path="*">
          <h1>TODO: Add 404 page</h1>
        </Route>
      </Switch>
    </div>
  );
};
