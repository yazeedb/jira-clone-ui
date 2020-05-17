import React, { FC } from 'react';
import { RobotSvg } from '../RobotSvg';
import './SomethingWentWrong.scss';
import { defaultHttpErrorMessage } from 'fetcher';

interface SomethingWentWrongProps {
  title?: string;
  subtitle?: string;
}

export const SomethingWentWrong: FC<SomethingWentWrongProps> = ({
  title = defaultHttpErrorMessage,
  subtitle = 'Please reload the page or try again later.'
}) => {
  return (
    <section className="something-went-wrong">
      <RobotSvg />
      <h1>{title}</h1>
      <h4>{subtitle}</h4>
    </section>
  );
};
