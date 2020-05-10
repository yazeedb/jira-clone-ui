import React from 'react';
import './Dashboard.scss';
import { useMachine } from '@xstate/react';
import { dashboardMachine } from 'machines/dashboardMachine';
import Spinner from '@atlaskit/spinner';

export const Dashboard = () => {
  const [current, send] = useMachine(dashboardMachine);

  console.log('Dashboard current:', current);

  const renderContent = () => {
    // switch (true) {
    // case current.matches('fetchingOrgs'):
    return (
      <section>
        <Spinner size="large" />
        <h2>Fetching your orgs</h2>
      </section>
    );

    // case current.matches('fetchingProjects'):

    // case current.matches('viewingProjects'):
    // }
  };

  return <main className="dashboard">{renderContent()}</main>;
};
