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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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

                  const taskLimitExceeded =
                    c.taskLimit !== null && c.tasks.length > c.taskLimit;

                  const lockColumns = [
                    'changingColumnName',
                    'creatingColumn',
                    'movingColumn',
                    'clearingColumnLimit',
                    'settingColumnLimit.saving',
                    'deletingColumn.saving'
                  ].some((s) => current.matches(`viewingProject.${s}`));

                  const columnClassName = [
                    {
                      cond: taskLimitExceeded,
                      className: 'task-limit-exceeded'
                    },
                    {
                      cond: lockColumns,
                      className: 'locked'
                    }
                  ].reduce(
                    (baseClassName, { cond, className }) =>
                      cond === true
                        ? `${baseClassName} ${className}`
                        : baseClassName,
                    'column'
                  );

                  return (
                    <Draggable draggableId={c.id} index={index} key={c.id}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          className={columnClassName}
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                        >
                          <ColumnHeader
                            dragHandleProps={dragProvided.dragHandleProps}
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
                                column: c
                              })
                            }
                            onClearColumnLimit={() =>
                              send({
                                type: 'CLEAR_COLUMN_LIMIT',
                                column: c
                              })
                            }
                            onDelete={() =>
                              send({
                                type: 'DELETE_COLUMN',
                                column: c
                              })
                            }
                            disableDelete={project.columns.length === 1}
                            disableDeleteMessage="The last column can't be deleted"
                            taskLimitExceeded={taskLimitExceeded}
                            isLoading={lockColumns}
                          />

                          {c.tasks
                            .filter((t) => !t.pendingDelete)
                            .map((t, index) => (
                              <TaskComponent
                                task={t}
                                key={t.id}
                                projectKey={project.key}
                                isLocked={lockColumns}
                                isFirstInColumn={index === 0}
                                isLastInColumn={index < c.tasks.length - 1}
                                onMoveToTop={() =>
                                  send({
                                    type: 'MOVE_TASK',
                                    task: t,
                                    oldColumnId: c.id,
                                    newColumnId: c.id,
                                    oldIndex: index,
                                    newIndex: 0
                                  })
                                }
                                onMoveToBottom={() =>
                                  send({
                                    type: 'MOVE_TASK',
                                    task: t,
                                    oldColumnId: c.id,
                                    newColumnId: c.id,
                                    oldIndex: index,
                                    newIndex: c.tasks.length - 1
                                  })
                                }
                                onDelete={() =>
                                  send({
                                    type: 'DELETE_TASK',
                                    column: c,
                                    task: t
                                  })
                                }
                              />
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
                              readView={() =>
                                !lockColumns && (
                                  <Button
                                    appearance="subtle"
                                    iconBefore={
                                      <EditorAddIcon label="Create project" />
                                    }
                                    className="create-project-button"
                                  >
                                    Create issue
                                  </Button>
                                )
                              }
                              editView={(fieldProps) => (
                                <TextField
                                  {...fieldProps}
                                  autoFocus
                                  placeholder="What needs to be done?"
                                  autoComplete="off"
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
                      )}
                    </Draggable>
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

            {current.matches('viewingProject.pendingDeleteTask') && (
              <Modal
                autoFocus
                key="active-modal"
                appearance="danger"
                width="small"
                heading="Delete FP-18?"
                actions={[
                  {
                    text: 'Delete',
                    onClick: () => send({ type: 'CONFIRM' })
                  },
                  {
                    text: 'Cancel',
                    onClick: () => send({ type: 'CANCEL' })
                  }
                ]}
                onClose={() => send({ type: 'CANCEL' })}
              >
                <p>
                  You're about to permanently delete this issue, its comments
                  and attachments, and all of its data.
                </p>
                <p>
                  If you're not sure, you can resolve or close this issue
                  instead.
                </p>
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

  return (
    <DragDropContext
      onDragEnd={({ destination, source, draggableId, type }) => {}}
    >
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(dropProvided) => (
          <main
            className="board"
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
          >
            {' '}
            {renderContent()}
          </main>
        )}
      </Droppable>
    </DragDropContext>
  );
};
