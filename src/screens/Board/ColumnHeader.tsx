import React, { FC, useState } from 'react';
import CheckIcon from '@atlaskit/icon/glyph/check';
import { Column } from 'shared/interfaces/Project';
import { ButtonItem, Section } from '@atlaskit/menu';
import MoreIcon from '@atlaskit/icon/glyph/editor/more';
import Popup from '@atlaskit/popup';
import Button from '@atlaskit/button';
import TextField from '@atlaskit/textfield';
import InlineEdit from '@atlaskit/inline-edit';

interface ColumnHeaderProps {
  column: Column;
  showCheckmark: boolean;
  onChange: (value: string) => void;
  onChangeCancel: () => void;
}

export const ColumnHeader: FC<ColumnHeaderProps> = ({
  column,
  showCheckmark,
  onChange
}) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <header>
      <InlineEdit
        defaultValue={column.name}
        onConfirm={onChange}
        editView={(fieldProps) => <TextField {...fieldProps} autoFocus />}
        isRequired
        readView={() => <h6 className="title">{column.name}</h6>}
      />

      {showCheckmark && (
        <span className="check-icon">
          <CheckIcon label="check" />
        </span>
      )}

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
    </header>
  );
};
