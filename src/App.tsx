import React, { useEffect, useState, FC } from 'react';
import { Login } from './screens/Login';
import {
  BrowserRouter,
  Route,
  Switch,
  useHistory,
  Redirect,
  useLocation,
  Link
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
import EmptyState from '@atlaskit/empty-state';
import Button from '@atlaskit/button';

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
  const [current, send] = useMachine(authMachine, { devTools: true });

  const history = useHistory();
  const { pathname, search } = useLocation();
  const [intendedRoute] = useState(pathname + search);

  useEffect(() => {
    if (current.matches('appUsable')) {
      history.push(intendedRoute);
    } else {
      history.push(appRoutes.index);
    }
  }, [current.value, history, intendedRoute, current]);

  switch (true) {
    case ['notSignedIn', 'authenticating', 'loggingIn'].some(current.matches):
      return (
        <Login
          loading={['authenticating', 'loggingIn'].some(current.matches)}
          onSuccess={(idToken) => send({ type: 'TRY_LOGIN', idToken })}
          onFailure={(message) =>
            send({
              type: 'SIGN_IN_FAILED',
              data: { message }
            })
          }
        />
      );

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
          <EmptyState
            renderImage={() => <NotFoundSvg />}
            header="404 - Not found"
            description="Oops! Seems that page doesn't exist"
            primaryAction={
              <Link to={appRoutes.projects}>
                <Button appearance="primary">Go to projects</Button>
              </Link>
            }
          />
        </Route>
      </Switch>
    </div>
  );
};
