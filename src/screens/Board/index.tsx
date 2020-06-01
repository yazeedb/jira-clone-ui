import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMachine } from '@xstate/react';
import { boardMachine, initialContext } from 'machines/boardMachine';
import ProgressBar from '@atlaskit/progress-bar';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import TextField from '@atlaskit/textfield';
import EditorSearchIcon from '@atlaskit/icon/glyph/editor/search';
import { SomethingWentWrong } from 'shared/components/SomethingWentWrong';
import './Board.scss';
import { FindOneProjectParams } from 'shared/interfaces/Project';

export const Board = () => {
  const projectParams = useParams<FindOneProjectParams>();

  const [current, send] = useMachine(
    boardMachine.withContext({
      ...initialContext,
      projectParams
    })
  );

  const [filter, setFilter] = useState('');

  const renderContent = () => {
    switch (true) {
      case current.matches('fetching'):
        return <ProgressBar isIndeterminate />;

      case current.matches('viewingProject'): {
        const { project } = current.context;

        return (
          <>
            <Breadcrumbs>
              <BreadcrumbsItem text="Projects" />
              <BreadcrumbsItem text={project.name} />
            </Breadcrumbs>

            <h1 className="title">{project.key} board</h1>

            <TextField
              width="small"
              className="filter"
              isCompact
              elemAfterInput={
                <div style={{ marginRight: '5px' }}>
                  <EditorSearchIcon label="Find project" />
                </div>
              }
              value={filter}
              onChange={(event) => {
                setFilter(event.currentTarget.value.trim());
              }}
            />
          </>
        );
      }

      case current.matches('failed'):
        return <SomethingWentWrong subtitle={current.context.error} />;
    }
  };

  return <main className="board">{renderContent()}</main>;
};
