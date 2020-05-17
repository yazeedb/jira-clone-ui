import React from 'react';
import './Dashboard.scss';
import { useMachine } from '@xstate/react';
import { dashboardMachine } from 'machines/dashboardMachine';
import ProgressBar from '@atlaskit/progress-bar';
import { ViewProjects } from './ViewProjects';
import { Switch, Route } from 'react-router-dom';
import { SomethingWentWrong } from 'shared/components/SomethingWentWrong';

const Projects = () => {
  const [current, send] = useMachine(dashboardMachine);
  const { projectsService } = current.context;

  console.log('Dashboard current:', current);

  switch (true) {
    case current.matches('fetchingOrgs'):
      return <ProgressBar isIndeterminate />;

    case current.matches('receivejdOrgs'):
      return <ViewProjects projectsService={projectsService} />;

    case current.matches('fetchOrgFailed'):
      return <SomethingWentWrong />;

    default:
      console.error('Impossible state reached', current);
      return (
        <SomethingWentWrong
          title="Fatal system error"
          subtitle="Sorry about that! We're working to fix the issue immediately."
        />
      );
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
