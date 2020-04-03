import React, { Fragment, createContext, useEffect, useContext } from 'react';
import { Login } from './screens/Login';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { useMachine } from '@xstate/react';
import { fetcher } from './fetcher';
import { CompleteSignup } from './screens/CompleteSignup';
import { Notification } from 'shared/components/Notification';
import { authMachine, AuthStates } from './authMachine';
import { Dashboard } from 'screens/Dashboard';

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

    send('TRY_AUTH');
  }, [send]);

  const contextValue = {
    ...current.context,
    send
  };

  switch (current.value as AuthStates) {
    case AuthStates.pending:
      return <h1>Loading homie...</h1>;

    case AuthStates.success:
      return (
        <AuthContext.Provider value={contextValue}>
          <AuthenticatedApp />
        </AuthContext.Provider>
      );

    case AuthStates.fail:
    case AuthStates.idle:
      return (
        <AuthContext.Provider value={contextValue}>
          <Notification
            type="error"
            primaryMessage={contextValue.error}
            secondaryMessage="Please try again"
            handleClose={() => {
              send('RESET');
            }}
            show={current.matches(AuthStates.fail)}
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
  const { user, signupMachineActor } = useContext(AuthContext);
  const signupComplete = user.firstName && user.lastName;

  const nextRoute = signupComplete ? '/' : '/completeSignup';
  const NextComponent = signupComplete ? (
    <Dashboard />
  ) : (
    <CompleteSignup signupMachineActor={signupMachineActor} user={user} />
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
