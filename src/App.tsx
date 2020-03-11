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
import { fetcher } from './fetcher';

export const App = () => {
  /*
    Whenever user enters app, changes routes, makes a request,
    check to see if their session is valid.

    Make request to /user to verify session.
      if status == 401
        return <UnauthenticatedApp />

      else if status == 200
        return <AuthenticatedApp />

      else
        handle error somehow
  */

  return (
    <BrowserRouter>
      <AuthShell />
    </BrowserRouter>
  );
};

export const AuthContext = createContext<any>({});

const AuthShell = () => {
  const [auth, setAuth] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth
      }}
    >
      {auth ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </AuthContext.Provider>
  );
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
      <Route exact path="/">
        <AnotherOne />
      </Route>

      <Redirect to="/" />
    </Switch>
  );
};
