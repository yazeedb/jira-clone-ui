import React, { FC, useState } from 'react';
import CheckIcon from '@atlaskit/icon/glyph/check';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { Column } from 'shared/interfaces/Project';
import { ButtonItem, Section } from '@atlaskit/menu';
import MoreIcon from '@atlaskit/icon/glyph/editor/more';
import Popup from '@atlaskit/popup';
import Button from '@atlaskit/button';
import TextField from '@atlaskit/textfield';

interface ColumnHeaderProps {
  column: Column;
  showCheckmark: boolean;
  onChange: (value: string) => void;
  onChangeCancel: () => void;
}

export const ColumnHeader: FC<ColumnHeaderProps> = ({
  column,
  showCheckmark,
  onChange,
  onChangeCancel
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [editingHeader, setEditingHeader] = useState(false);

  const [name, setName] = useState(column.name);
  const resetName = () => setName(column.name);

  const cancelChanges = () => {
    setEditingHeader(false);
    resetName();
    onChangeCancel();
  };

  return (
    <header>
      {editingHeader ? (
        <form
          className="edit-column-name"
          onSubmit={(event) => {
            event.preventDefault();
            onChange(name);
          }}
        >
          <TextField
            autoFocus
            onFocus={(event) => event.target.select()}
            onBlur={cancelChanges}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                cancelChanges();
              }
            }}
          />

          <div className="form-controls">
            <Button
              type="submit"
              iconBefore={<CheckIcon size="small" label="Submit" />}
            />

            <Button
              onClick={cancelChanges}
              iconBefore={<CrossIcon size="small" label="Cancel" />}
            />
          </div>
        </form>
      ) : (
        <>
          <div className="title-wrapper">
            <Button appearance="subtle" onClick={() => setEditingHeader(true)}>
              {column.name}
            </Button>

            {showCheckmark && (
              <span className="check-icon">
                <CheckIcon label="check" />
              </span>
            )}
          </div>

          <Popup
            isOpen={showPopup}
            onClose={() => setShowPopup(false)}
            placement="bottom-end"
            content={() => (
              <Section>
                <ButtonItem>Set column limit</ButtonItem>
                <ButtonItem>Delete</ButtonItem>
              </Section>
            )}
            trigger={(triggerProps) => (
              <Button
                {...triggerProps}
                isSelected={showPopup}
                onClick={() => setShowPopup(true)}
                className={showPopup ? 'more-icon show' : 'more-icon'}
                iconBefore={<MoreIcon size="large" label="More" />}
              />
            )}
          />
        </>
      )}
    </header>
  );
};
