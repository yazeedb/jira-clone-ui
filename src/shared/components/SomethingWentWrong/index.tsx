import React, { FC } from 'react';
import './SomethingWentWrong.scss';
import { defaultHttpErrorMessage } from 'fetcher';
import { ServerDownSvg } from '../ServerDownSvg';

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
      <ServerDownSvg />
      <h1 className="title">{title}</h1>
      <h4 className="subtitle">{subtitle}</h4>
    </section>
  );
};
