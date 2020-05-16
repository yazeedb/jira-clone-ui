import React, { FC, HTMLProps } from 'react';
import './ActionButton.scss';

interface ActionButtonProps extends HTMLProps<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset';
}

export const ActionButton: FC<ActionButtonProps> = ({
  className,
  ...buttonProps
}) => {
  return <button className={`action-button ${className}`} {...buttonProps} />;
};
