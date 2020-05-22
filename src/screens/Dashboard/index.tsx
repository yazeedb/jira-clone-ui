import React from 'react';
import { Switch, Route } from 'react-router-dom';
import './Dashboard.scss';
import { Projects } from 'screens/Projects';

export const Dashboard = () => {
  return (
    <main className="dashboard">
      <Switch>
        <Route exact path="/projects">
          <Projects />
        </Route>

        <Route exact path="/people">
          <h1>TODO: Create people page</h1>
        </Route>
      </Switch>
    </main>
  );
};
