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
import { ColumnHeader } from './ColumnHeader';
import InlineEdit from '@atlaskit/inline-edit';

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

            <section className="columns-wrapper">
              <section className="columns">
                {project.columns.map((c, index) => {
                  const isFirstColumn = index === 0;
                  const isLastColumn = index === project.columns.length - 1;

                  // TODO: Have a column.id property (update server logic)
                  return (
                    <div
                      className="column"
                      // TODO: Make this c.id when the backend is ready
                      key={c.name}
                    >
                      <ColumnHeader
                        column={c}
                        showCheckmark={isLastColumn}
                        onChange={(newName) =>
                          send({
                            type: 'RENAME_COLUMN',
                            id: c.id,
                            newName
                          })
                        }
                        onChangeCancel={console.warn}
                      />

                      {!isFirstColumn && hasNoIssues ? null : (
                        <InlineEdit
                          defaultValue=""
                          onConfirm={console.log}
                          readViewFitContainerWidth
                          hideActionButtons
                          isRequired
                          readView={() => (
                            <Button
                              appearance="subtle"
                              iconBefore={
                                <EditorAddIcon label="Create project" />
                              }
                              className="create-project-button"
                            >
                              Create issue
                            </Button>
                          )}
                          editView={() => (
                            <TextField
                              autoFocus
                              placeholder="What needs to be done?"
                              style={{
                                paddingTop: '20px',
                                paddingBottom: '70px',
                                paddingLeft: '15px'
                              }}
                              elemBeforeInput={
                                <img
                                  src="/task-icon.svg"
                                  alt="Task icon"
                                  style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '17px'
                                  }}
                                />
                              }
                            />
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </section>

              <InlineEdit
                defaultValue=""
                isRequired
                onConfirm={console.log}
                editView={(fieldProps) => (
                  <TextField
                    {...fieldProps}
                    autoFocus
                    className="create-column-input"
                  />
                )}
                readView={() => (
                  <Button
                    iconBefore={<AddIcon label="Add column" />}
                    className="add-column"
                  />
                )}
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
