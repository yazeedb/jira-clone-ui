import React, { FC } from 'react';
import BoardIcon from '@atlaskit/icon/glyph/board';
import { Project } from 'shared/interfaces/Project';
import './ProjectCard.scss';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  return (
    <section className="project-card">
      <header>
        <img
          className="project-avatar"
          src="mockProjectAvatar.svg"
          alt={project.name}
        />

        <div>
          <span>{project.name}</span>
          <p className="project-type">{project.type}</p>
        </div>
      </header>

      <footer>
        <BoardIcon label="board" size="small" />
        <p className="project-key">{project.key} board</p>
      </footer>
    </section>
  );
};
