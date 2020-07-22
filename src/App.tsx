import React, { useEffect, useState, FC } from 'react';
import { Login } from './screens/Login';
import {
  BrowserRouter,
  Route,
  Switch,
  useHistory,
  Redirect,
  useLocation
} from 'react-router-dom';
import { useMachine, useService } from '@xstate/react';
import { CompleteSignup } from './screens/CompleteSignup';
import { Notification } from './shared/components/Notification';
import { authMachine } from './machines/authMachine';
import { ConfirmOrg } from './screens/ConfirmOrg';
import { GlobalNav } from './shared/components/GlobalNav';
import { NotFoundSvg } from './shared/components/NotFoundSvg';
import { Projects } from './screens/Projects';
import { Board } from './screens/Board';
import { appRoutes } from 'shared/appRoutes';
import { notificationService } from 'machines/notificationMachine';
import { User } from 'shared/interfaces/User';

export const App = () => {
  const [current, send] = useService(notificationService);

  return (
    <BrowserRouter>
      <AuthShell />

      <Notification
        show={['opened', 'paused'].some(current.matches)}
        type={current.context.notificationType}
        primaryMessage={current.context.message}
        onHover={() => send('PAUSE')}
        onLeave={() => send('RESUME')}
        handleClose={() => send('CLOSE')}
      />
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
  const { pathname, search } = useLocation();
  const [intendedRoute] = useState(pathname + search);

  useEffect(() => {
    if (current.matches('appUsable')) {
      history.push(intendedRoute);
    }
  }, [current.value, history, intendedRoute, current]);

  switch (true) {
    case current.matches('notSignedIn'):
    case current.matches('authenticating'):
      return <Login loading={current.matches('authenticating')} send={send} />;

    case current.matches('awaitingSignup'):
      return (
        <CompleteSignup
          user={current.context.user}
          signupService={current.context.signupService}
        />
      );

    case current.matches('awaitingOrgConfirmation'):
      return (
        <ConfirmOrg
          confirmOrgService={current.context.confirmOrgService}
          user={current.context.user}
        />
      );

    case current.matches('appUsable'):
      return <AuthenticatedApp user={current.context.user} />;

    default:
      console.error('Default case hit!', current);
      return null;
  }
};

interface AuthenticatedAppProps {
  user: User;
}
const AuthenticatedApp: FC<AuthenticatedAppProps> = ({ user }) => {
  return (
    <div className="authenticated-app">
      <GlobalNav />

      <Route
        exact
        path={appRoutes.index}
        component={() => <Redirect to={appRoutes.projects} />}
      />

      <Switch>
        <Route exact path={appRoutes.projects}>
          <Projects />
        </Route>

        <Route exact path={appRoutes.board}>
          <Board user={user} />
        </Route>

        <Route exact path={appRoutes.people}>
          <h1>TODO: Create people page</h1>
        </Route>

        <Route path="*">
          <div
            style={{
              width: '400px',
              margin: '100px auto',
              textAlign: 'center'
            }}
          >
            <NotFoundSvg />
            <h1>Oops!</h1>
            <h2>404 - Not found</h2>
          </div>
        </Route>
      </Switch>
    </div>
  );
};
