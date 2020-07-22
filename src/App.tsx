import React, { useEffect, useState } from 'react';
import { Login } from './screens/Login';
import {
  BrowserRouter,
  Route,
  Switch,
  useHistory,
  Redirect,
  useLocation
} from 'react-router-dom';
import { useMachine } from '@xstate/react';
import { CompleteSignup } from './screens/CompleteSignup';
import {
  Notification,
  NotificationType
} from './shared/components/Notification';
import { authMachine } from './machines/authMachine';
import { ConfirmOrg } from './screens/ConfirmOrg';
import { GlobalNav } from './shared/components/GlobalNav';
import { NotFoundSvg } from './shared/components/NotFoundSvg';
import { Projects } from './screens/Projects';
import { Board } from './screens/Board';
import { appRoutes } from 'shared/appRoutes';
import { NotificationMachine } from 'machines/notificationMachine';

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
  const { pathname, search } = useLocation();
  const [intendedRoute] = useState(pathname + search);

  useEffect(() => {
    if (current.matches('appUsable')) {
      history.push(intendedRoute);
    }
  }, [current.value, history, intendedRoute, current]);

  switch (true) {
    case current.matches('notSignedIn'):
    case current.matches('signinFailed'):
    case current.matches('authenticating'):
      return (
        <>
          <Login loading={current.matches('authenticating')} send={send} />

          <Notification
            show={current.matches('signinFailed')}
            type="error"
            primaryMessage={current.context.error}
            secondaryMessage="Please try again"
            handleClose={() => send('CLEAR_ERROR')}
            onHover={() => {}}
            onLeave={() => {}}
          />
        </>
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
      return <AuthenticatedApp />;

    default:
      console.error('Default case hit!', current);
      return null;
  }
};

export const NotificationContext = React.createContext<any>({});

const AuthenticatedApp = () => {
  const [current, send] = useMachine(NotificationMachine, {
    devTools: true
  });

  const openNotification = (
    primaryMessage: string,
    secondaryMessage: string,
    type: NotificationType
  ) => {
    send({
      type: 'OPEN',
      message: primaryMessage,
      notificationType: type
    });
  };

  return (
    <NotificationContext.Provider value={openNotification}>
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
            <Board />
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
      <Notification
        show={['opened', 'paused'].some(current.matches)}
        type={current.context.notificationType}
        primaryMessage={current.context.message}
        secondaryMessage=""
        onHover={() => send('PAUSE')}
        onLeave={() => send('RESUME')}
        handleClose={() => send('CLOSE')}
      />
    </NotificationContext.Provider>
  );
};
