import React, { FC } from 'react';
import { Task } from 'shared/interfaces/Project';
import './Task.scss';

interface TaskProps {
  task: Task;
}

export const TaskComponent: FC<TaskProps> = ({ task }) => {
  return (
    <div className="task">
      <h1>Hello</h1> {JSON.stringify(task)}
    </div>
  );
};
