import React, { FC, useState } from 'react';
import CheckIcon from '@atlaskit/icon/glyph/check';
import { Column } from 'shared/interfaces/Project';
import { ButtonItem, Section } from '@atlaskit/menu';
import MoreIcon from '@atlaskit/icon/glyph/editor/more';
import Popup from '@atlaskit/popup';
import Button from '@atlaskit/button';

interface BoardHeaderProps {
  column: Column;
  showCheckmark: boolean;
}

export const BoardHeader: FC<BoardHeaderProps> = ({
  column,
  showCheckmark
}) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <header>
      <div className="title-wrapper">
        <h6 className="title">{column.name}</h6>

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
    </header>
  );
};
