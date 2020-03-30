import React, { FC } from 'react';
import './Notification.scss';

type NotificationType = 'success' | 'error';

interface NotificationProps {
  primaryMessage: string;
  secondaryMessage: string;
  type: NotificationType;
  onClose: () => void;
}

export const Notification: FC<NotificationProps> = ({
  primaryMessage,
  secondaryMessage,
  type,
  onClose
}) => {
  return (
    <div className={`notification ${type}`}>
      <img src={`/icon-${type}.svg`} className="icon-logo" />

      <section className="message-container">
        <h4>{primaryMessage}</h4>
        <p>{secondaryMessage}</p>
      </section>
      <button className="close" onClick={onClose}>
        <img src="/icon-close.svg" />
      </button>
    </div>
  );
};
