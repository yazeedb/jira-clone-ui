import React from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import './Dashboard.scss';
import { useMachine } from '@xstate/react';
import { dashboardMachine } from 'machines/dashboardMachine';

export const Dashboard = () => {
  const [current, send] = useMachine(dashboardMachine);

  console.log('Dashboard current:', current);

  return <main className="dashboard"></main>;
};
