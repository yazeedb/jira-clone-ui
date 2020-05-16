import React from 'react';
import { RobotImg } from '../RobotImg';
import './SomethingWentWrong.scss';

export const SomethingWentWrong = () => {
  return (
    <section className="something-went-wrong">
      <h1>An error occurred</h1>
      <RobotImg />
    </section>
  );
};
