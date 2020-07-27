import React, { FC, useState } from 'react';
import MoreIcon from '@atlaskit/icon/glyph/editor/more';
import Button from '@atlaskit/button';
import { ButtonItem, Section } from '@atlaskit/menu';
import Popup from '@atlaskit/popup';
import { Task } from 'shared/interfaces/Project';
import './Task.scss';

interface TaskProps {
  task: Task;
  projectKey: string;
  isLocked: boolean;
  onDelete: () => void;
}

export const TaskComponent: FC<TaskProps> = ({
  task,
  projectKey,
  isLocked,
  onDelete
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const closePopup = () => setShowPopup(false);
  const openPopup = () => setShowPopup(true);

  return (
    <div className="task">
      <header>
        <span>{task.name}</span>

        <Popup
          isOpen={showPopup}
          onClose={closePopup}
          placement="bottom-end"
          content={() => (
            <Section>
              {/* 
              TODO: Add Copy Issue Link functionality
              <ButtonItem
                onClick={() => {
                  closePopup();
                }}
              >
                Copy issue link
              </ButtonItem> */}

              <ButtonItem
                onClick={() => {
                  closePopup();
                  onDelete();
                }}
              >
                Delete
              </ButtonItem>
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
      </header>

      <footer>
        <img src="/task-icon.svg" />
        <span className="ui-sequence">
          {projectKey}-{task.uiSequence}
        </span>
      </footer>
    </div>
  );
};
