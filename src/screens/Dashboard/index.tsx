import React from 'react';
import './Dashboard.scss';
import { useMachine } from '@xstate/react';
import { dashboardMachine } from 'machines/dashboardMachine';
import ProgressBar from '@atlaskit/progress-bar';
import { ViewProjects } from './ViewProjects';
import { Switch, Route } from 'react-router-dom';

export const Dashboard = () => {
  const RenderProjects = () => {
    const [current, send] = useMachine(dashboardMachine);
    console.log('Dashboard current:', current);

    switch (current.value) {
      case 'fetchingOrgs':
      case 'fetchingProjects':
        return <ProgressBar isIndeterminate />;

      case 'viewingProjects':
        return <ViewProjects projects={current.context.projects} />;

      default:
        console.error('Impossible state reached', current);
        return null;
    }
  };

  return (
    <main className="dashboard">
      <Switch>
        <Route exact path="/projects">
          <RenderProjects />
        </Route>

        <Route exact path="/people">
          <h1>TODO: Create people page</h1>
        </Route>
      </Switch>
    </main>
  );
};
