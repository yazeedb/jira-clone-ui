import React, { FC } from 'react';
import Flag, { AppearanceTypes } from '@atlaskit/flag';
import { N500, G400, Y300, R300 } from '@atlaskit/theme/colors';
import Tick from '@atlaskit/icon/glyph/check-circle';
import Error from '@atlaskit/icon/glyph/error';
import Info from '@atlaskit/icon/glyph/info';
import Warning from '@atlaskit/icon/glyph/warning';
import './Notification.scss';

const iconMap = new Map<AppearanceTypes, any>([
  ['info', <Info label="Info icon" primaryColor={N500} />],
  ['success', <Tick label="Success" primaryColor={G400} />],
  ['warning', <Warning label="Warning icon" primaryColor={Y300} />],
  ['error', <Error label="Error icon" primaryColor={R300} />]
]);

interface NotificationProps {
  primaryMessage: string;
  type: AppearanceTypes;
  handleClose: () => void;
  onHover: () => void;
  onLeave: () => void;
  show: boolean;
}

export const Notification: FC<NotificationProps> = ({
  primaryMessage,
  type = 'info',
  handleClose,
  onHover,
  onLeave,
  show
}) => {
  const baseClassName = `notification ${type}`;
  const className = show ? `${baseClassName} show` : baseClassName;

  return (
    <div
      className={className}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={handleClose}
    >
      <Flag title={primaryMessage} icon={iconMap.get(type)} id="1" key="1" />
    </div>
  );
};
