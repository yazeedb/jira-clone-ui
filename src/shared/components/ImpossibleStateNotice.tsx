import React from 'react';
import { SomethingWentWrong } from './SomethingWentWrong';

export const ImpossibleStateNotice = () => {
  return (
    <SomethingWentWrong
      title="Fatal system error"
      subtitle="Sorry about that! We're working to fix the issue."
    />
  );
};
