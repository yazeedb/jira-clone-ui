import React from 'react';
import './Dashboard.scss';
import { useMachine } from '@xstate/react';
import { dashboardMachine } from 'machines/dashboardMachine';
import ProgressBar from '@atlaskit/progress-bar';
import { ViewProjects } from './ViewProjects';
import { Redirect } from 'react-router-dom';

export const Dashboard = () => {
  const [current, send] = useMachine(dashboardMachine);

  console.log('Dashboard current:', current);

  const renderContent = () => {
    switch (true) {
      case current.matches('fetchingOrgs'):
      case current.matches('fetchingProjects'):
        return <ProgressBar isIndeterminate />;

      case current.matches('viewingProjects'):
        return <ViewProjects projects={current.context.projects} />;
    }
  };

  return <main className="dashboard">{renderContent()}</main>;
};
