import React from 'react';
import { useParams } from 'react-router-dom';
import { useMachine } from '@xstate/react';
import { boardMachine, initialContext } from 'machines/boardMachine';
import ProgressBar from '@atlaskit/progress-bar';
import { SomethingWentWrong } from 'shared/components/SomethingWentWrong';
import './Board.scss';

type UrlParams = { orgId: string; projectKey: string };

export const Board = () => {
  const { orgId, projectKey } = useParams<UrlParams>();

  const [current, send] = useMachine(
    boardMachine.withContext({
      ...initialContext,
      orgId,
      projectKey
    })
  );

  const renderContent = () => {
    switch (true) {
      case current.matches('fetching'):
        return <ProgressBar isIndeterminate />;

      case current.matches('viewingProject'):
        return <h1>Got your project</h1>;

      case current.matches('failed'):
        return <SomethingWentWrong subtitle={current.context.error} />;
    }
  };

  return <main className="board">{renderContent()}</main>;
};
