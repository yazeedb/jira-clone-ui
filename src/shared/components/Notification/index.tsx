import React, { FC } from 'react';
import './Notification.scss';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import CheckIcon from '@atlaskit/icon/glyph/check';
import { colors } from '@atlaskit/theme';

export type NotificationType = 'success' | 'error';

const iconMap = new Map<NotificationType, any>([
  ['error', <ErrorIcon label={'error'} primaryColor={colors.red()} />],
  ['success', <CheckIcon label={'success'} primaryColor={colors.green()} />]
]);

interface NotificationProps {
  primaryMessage: string;
  secondaryMessage: string;
  type: NotificationType;
  handleClose: () => void;
  onHover: () => void;
  onLeave: () => void;
  show: boolean;
}

export const Notification: FC<NotificationProps> = ({
  primaryMessage,
  secondaryMessage,
  type = 'success',
  handleClose,
  onHover,
  onLeave,
  show
}) => {
  const baseClassName = `notification ${type}`;
  const className = show ? `${baseClassName} show` : baseClassName;

  return (
    <div className={className} onMouseEnter={onHover} onMouseLeave={onLeave}>
      {iconMap.get(type)}
      <section className="message-container">
        <h4>{primaryMessage}</h4>
        <p>{secondaryMessage}</p>
      </section>
      <button className="close" onClick={handleClose}>
        <CrossIcon label={'close'} />
      </button>
    </div>
  );
};
