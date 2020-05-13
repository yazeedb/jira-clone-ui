import React from 'react';
import './Dashboard.scss';
import { useMachine } from '@xstate/react';
import { dashboardMachine } from 'machines/dashboardMachine';
import ProgressBar from '@atlaskit/progress-bar';
import { ViewProjects } from './ViewProjects';
import { Switch, Route } from 'react-router-dom';

const Projects = () => {
  const [current, send] = useMachine(dashboardMachine);
  const { projectsService } = current.context;

  console.log('Dashboard current:', current);

  switch (true) {
    case current.matches('fetchingOrgs'):
      return <ProgressBar isIndeterminate />;

    case current.matches('receivedOrgs'):
      return <ViewProjects projectsService={projectsService} />;

    case current.matches('fetchOrgFailed'):
      return <h1>Oh no!</h1>;

    default:
      console.error('Impossible state reached', current);
      return null;
  }
};

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
