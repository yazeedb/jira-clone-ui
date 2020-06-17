import React, { useState, forwardRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useMachine } from '@xstate/react';
import {
  boardMachine,
  initialContext,
  getTotalIssues
} from 'machines/boardMachine';
import ProgressBar from '@atlaskit/progress-bar';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import TextField from '@atlaskit/textfield';
import EditorSearchIcon from '@atlaskit/icon/glyph/editor/search';
import { SomethingWentWrong } from 'shared/components/SomethingWentWrong';
import './Board.scss';
import { FindOneProjectParams } from 'shared/interfaces/Project';
import { appRoutes } from 'shared/appRoutes';
import { parseQuery } from 'shared/utils/parseQuery';
import AddIcon from '@atlaskit/icon/glyph/add';
import EditorAddIcon from '@atlaskit/icon/glyph/editor/add';
import Button from '@atlaskit/button';
import CheckIcon from '@atlaskit/icon/glyph/check';

export const Board = () => {
  const projectParams = useParams<FindOneProjectParams>();
  const { selectedIssue } = parseQuery(useLocation().search);

  const [current, send] = useMachine(
    boardMachine.withContext({
      ...initialContext,
      projectParams,
      selectedIssue
    })
  );

  console.log('Board machine:', current);

  const [filter, setFilter] = useState('');

  const renderContent = () => {
    switch (true) {
      case current.matches('fetching'):
        return <ProgressBar isIndeterminate />;

      case current.matches('viewingProject'): {
        const { project } = current.context;
        const hasNoIssues = getTotalIssues(project.columns) === 0;

        return (
          <>
            <Breadcrumbs>
              <BreadcrumbsItem
                href={appRoutes.projects}
                text="Projects"
                component={forwardRef(({ href, ...otherProps }: any, ref) => (
                  <Link to={href} ref={ref} {...otherProps} />
                ))}
              />

              <BreadcrumbsItem href="" text={project.name} />
            </Breadcrumbs>

            <h1 className="board-title">{project.key} board</h1>

            <div className="filter-container">
              <TextField
                className="filter"
                placeholder="Filter issues"
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
            </div>

            <section className="columns">
              {project.columns.map((c, index) => {
                const isFirstColumn = index === 0;
                const isLastColumn = index === project.columns.length - 1;

                return (
                  <div key={c.id} className="column">
                    <header>
                      <h6 className="title">{c.name}</h6>
                      {isLastColumn && (
                        <span className="icon-wrapper">
                          <CheckIcon label="check" />
                        </span>
                      )}
                    </header>

                    {!isFirstColumn && hasNoIssues ? null : (
                      <Button
                        appearance="subtle"
                        iconBefore={<EditorAddIcon label="Create project" />}
                        className="create-project-button"
                      >
                        Create issue
                      </Button>
                    )}
                  </div>
                );
              })}

              <Button
                appearance="default"
                iconBefore={<AddIcon label="Add column" />}
                className="add-column"
              />
            </section>
          </>
        );
      }

      case current.matches('failed'):
        return <SomethingWentWrong subtitle={current.context.error} />;
    }
  };

  return <main className="board">{renderContent()}</main>;
};
