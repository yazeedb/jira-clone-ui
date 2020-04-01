import React, { FC } from 'react';
import './Notification.scss';

type NotificationType = 'success' | 'error';

interface NotificationProps {
  primaryMessage: string;
  secondaryMessage: string;
  type: NotificationType;
  handleClose: () => void;
}

export const Notification: FC<NotificationProps> = ({
  primaryMessage,
  secondaryMessage,
  type,
  handleClose
}) => {
  return (
    <div className={`notification ${type}`}>
      <img src={`/icon-${type}.svg`} className="icon-logo" alt={type} />

      <section className="message-container">
        <h4>{primaryMessage}</h4>
        <p>{secondaryMessage}</p>
      </section>
      <button className="close" onClick={handleClose}>
        <img src="/icon-close.svg" alt="close" />
      </button>
    </div>
  );
};
