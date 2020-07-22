import React, { useState, forwardRef, FC } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useMachine } from '@xstate/react';
import {
  boardMachine,
  initialContext,
  getTotalIssues
} from 'machines/boardMachine';
import ProgressBar from '@atlaskit/progress-bar';
import Modal from '@atlaskit/modal-dialog';
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
import { SetColumnLimit } from './SetColumnLimit';
import { TaskComponent } from 'shared/components/Task';
import { User } from 'shared/interfaces/User';

interface BoardProps {
  user: User;
}

export const Board: FC<BoardProps> = ({ user }) => {
  const projectParams = useParams<FindOneProjectParams>();
  const { selectedIssue } = parseQuery(useLocation().search);

  const [current, send] = useMachine(
    boardMachine.withContext({
      ...initialContext,
      projectParams,
      selectedIssue
    }),
    { devTools: true }
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

                  const baseClassName = 'column';

                  const taskLimitExceeded =
                    c.taskLimit !== null && c.tasks.length > c.taskLimit;

                  const columnClassName = taskLimitExceeded
                    ? `${baseClassName} task-limit-exceeded`
                    : baseClassName;

                  return (
                    <div className={columnClassName} key={c.id}>
                      <ColumnHeader
                        column={c}
                        showCheckmark={isLastColumn}
                        onChange={(newValue) => {
                          send({
                            type: 'CHANGE_COLUMN_NAME',
                            id: c.id,
                            oldValue: c.name,
                            newValue,
                            projectKey: project.key,
                            orgName: project.orgName
                          });
                        }}
                        onSetColumnLimit={() =>
                          send({
                            type: 'SET_COLUMN_LIMIT',
                            id: c.id
                          })
                        }
                        onClearColumnLimit={() =>
                          send({
                            type: 'CLEAR_COLUMN_LIMIT',
                            id: c.id
                          })
                        }
                        onDelete={() =>
                          send({
                            type: 'DELETE_COLUMN',
                            id: c.id
                          })
                        }
                        disableDelete={project.columns.length === 1}
                        disableDeleteMessage="The last column can't be deleted"
                        taskLimitExceeded={taskLimitExceeded}
                      />

                      {c.tasks.map((t) => (
                        <TaskComponent task={t} key={t.id} />
                      ))}

                      {!isFirstColumn && hasNoIssues ? null : (
                        <InlineEdit
                          defaultValue=""
                          readViewFitContainerWidth
                          hideActionButtons
                          isRequired
                          onConfirm={(taskName) =>
                            send({
                              type: 'CREATE_TASK',
                              name: taskName,
                              reporterId: user.sub,
                              columnId: c.id
                            })
                          }
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
                          editView={(fieldProps) => (
                            <TextField
                              {...fieldProps}
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
                onConfirm={(name) =>
                  send({
                    type: 'CREATE_COLUMN',
                    name
                  })
                }
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

            {current.matches('viewingProject.deletingColumn.awaiting') && (
              <Modal
                autoFocus
                key="active-modal"
                appearance="danger"
                width="small"
                actions={[
                  {
                    text: 'Delete',
                    onClick: () => send({ type: 'CONFIRM_DELETE_COLUMN' })
                  },
                  {
                    text: 'Cancel',
                    onClick: () => send({ type: 'CLOSE_DELETE_COLUMN' })
                  }
                ]}
                onClose={() => send({ type: 'CLOSE_DELETE_COLUMN' })}
                heading="You're about to delete this column"
              >
                Are you sure you want to delete this column?
              </Modal>
            )}

            {current.matches('viewingProject.settingColumnLimit.awaiting') && (
              <SetColumnLimit
                onClose={() => send({ type: 'CLOSE_COLUMN_LIMIT' })}
                onSubmit={(limit) =>
                  send({
                    type: 'SUBMIT_COLUMN_LIMIT',
                    limit
                  })
                }
              />
            )}
          </>
        );
      }

      case current.matches('failed'):
        return <SomethingWentWrong subtitle={current.context.error} />;
    }
  };

  return <main className="board">{renderContent()}</main>;
};
