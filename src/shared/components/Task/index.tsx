import React, { FC } from 'react';
import { Task } from 'shared/interfaces/Project';
import './Task.scss';

interface TaskProps {
  task: Task;
}

export const TaskComponent: FC<TaskProps> = ({ task }) => {
  return (
    <div className="task">
      <span>{task.name}</span>
    </div>
  );
};
