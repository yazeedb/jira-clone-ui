import React, { FC, useState } from 'react';
import MoreIcon from '@atlaskit/icon/glyph/editor/more';
import Button from '@atlaskit/button';
import Spinner from '@atlaskit/spinner';
import { ButtonItem, Section } from '@atlaskit/menu';
import Popup from '@atlaskit/popup';
import { Task } from 'shared/interfaces/Project';
import './Task.scss';
import { Draggable } from 'react-beautiful-dnd';

interface TaskProps {
  task: Task;
  index: number;
  projectKey: string;
  isLocked: boolean;
  isFirstInColumn: boolean;
  isLastInColumn: boolean;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
  onDelete: () => void;
}

export const TaskComponent: FC<TaskProps> = ({
  task,
  index,
  projectKey,
  isLocked,
  isFirstInColumn,
  isLastInColumn,
  onMoveToTop,
  onMoveToBottom,
  onDelete
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const closePopup = () => setShowPopup(false);
  const openPopup = () => setShowPopup(true);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(dragProvided) => (
        <div
          className="task"
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          ref={dragProvided.innerRef}
        >
          <header>
            <span>{task.name}</span>

            {!task.pendingCreation && (
              <Popup
                isOpen={showPopup}
                onClose={closePopup}
                placement="bottom-end"
                content={() => (
                  <Section>
                    <ButtonItem
                      onClick={() => {
                        closePopup();
                        onDelete();
                      }}
                    >
                      Delete
                    </ButtonItem>

                    {!isFirstInColumn && (
                      <ButtonItem
                        onClick={() => {
                          closePopup();
                          onMoveToTop();
                        }}
                      >
                        Move to top
                      </ButtonItem>
                    )}

                    {isLastInColumn && (
                      <ButtonItem
                        onClick={() => {
                          closePopup();
                          onMoveToBottom();
                        }}
                      >
                        Move to bottom
                      </ButtonItem>
                    )}
                  </Section>
                )}
                trigger={(triggerProps) =>
                  !isLocked && (
                    <Button
                      {...triggerProps}
                      isSelected={showPopup}
                      onClick={showPopup ? closePopup : openPopup}
                      className={
                        showPopup ? 'more-actions show' : 'more-actions hide'
                      }
                      iconBefore={<MoreIcon size="large" label="More" />}
                    />
                  )
                }
              />
            )}
          </header>

          <footer>
            {task.pendingCreation ? (
              <div className="spinner-container" style={{ marginLeft: 'auto' }}>
                <Spinner />
              </div>
            ) : (
              <>
                <img src="/task-icon.svg" />
                <span className="ui-sequence">
                  {projectKey}-{task.uiSequence}
                </span>
              </>
            )}
          </footer>
        </div>
      )}
    </Draggable>
  );
};
