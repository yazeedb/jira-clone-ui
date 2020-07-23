import React, { FC, useState } from 'react';
import CheckIcon from '@atlaskit/icon/glyph/check';
import { Column } from 'shared/interfaces/Project';
import { ButtonItem, Section } from '@atlaskit/menu';
import MoreIcon from '@atlaskit/icon/glyph/editor/more';
import Popup from '@atlaskit/popup';
import Button from '@atlaskit/button';
import TextField from '@atlaskit/textfield';
import InlineEdit from '@atlaskit/inline-edit';
import { Tooltip } from 'react-tippy';
import Lozenge from '@atlaskit/lozenge';

interface ColumnHeaderProps {
  column: Column;
  showCheckmark: boolean;
  onChange: (value: string) => void;
  onSetColumnLimit: () => void;
  onClearColumnLimit: () => void;
  onDelete: () => void;
  disableDelete: boolean;
  disableDeleteMessage: string;
  taskLimitExceeded: boolean;
}

export const ColumnHeader: FC<ColumnHeaderProps> = ({
  column,
  showCheckmark,
  onChange,
  onSetColumnLimit,
  onClearColumnLimit,
  onDelete,
  disableDelete,
  disableDeleteMessage,
  taskLimitExceeded
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const closePopup = () => setShowPopup(false);
  const openPopup = () => setShowPopup(true);

  const deleteButton = (
    <ButtonItem
      onClick={() => {
        onDelete();
        closePopup();
      }}
      isDisabled={disableDelete}
    >
      Delete
    </ButtonItem>
  );

  const renderDeleteButton = () =>
    disableDelete ? (
      <Tooltip distance={-80} title={disableDeleteMessage}>
        {deleteButton}
      </Tooltip>
    ) : (
      deleteButton
    );

  const { name, tasks, taskLimit } = column;

  return (
    <header>
      <InlineEdit
        defaultValue={name}
        onConfirm={onChange}
        editView={(fieldProps) => <TextField {...fieldProps} autoFocus />}
        isRequired
        readView={() => <h6 className="title">{name}</h6>}
      />

      <span className="tasks-count">{tasks.length}</span>

      {taskLimit && (
        <Tooltip title="This column will be highlighted when the number of issues exceeds this limit.">
          <Lozenge
            appearance={taskLimitExceeded ? 'moved' : 'default'}
            isBold={taskLimitExceeded}
          >
            MAX: {taskLimit}
          </Lozenge>
        </Tooltip>
      )}

      {showCheckmark && (
        <span className="check-icon">
          <CheckIcon label="check" size="small" />
        </span>
      )}

      <Popup
        isOpen={showPopup}
        onClose={closePopup}
        placement="bottom-end"
        content={() => (
          <Section>
            <ButtonItem
              onClick={() => {
                onSetColumnLimit();
                closePopup();
              }}
            >
              Set column limit
            </ButtonItem>

            <ButtonItem
              onClick={() => {
                onClearColumnLimit();
                closePopup();
              }}
            >
              Clear column limit
            </ButtonItem>

            {renderDeleteButton()}
          </Section>
        )}
        trigger={(triggerProps) => (
          <Button
            {...triggerProps}
            isSelected={showPopup}
            onClick={openPopup}
            className={showPopup ? 'more-icon show' : 'more-icon'}
            iconBefore={<MoreIcon size="large" label="More" />}
          />
        )}
      />
    </header>
  );
};
