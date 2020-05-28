import React, { FC } from 'react';
import BoardIcon from '@atlaskit/icon/glyph/board';
import { Project } from 'shared/interfaces/Project';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  return (
    <section
      style={{
        maxWidth: '260px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '3px',
        boxShadow:
          'rgba(9, 30, 66, 0.25) 0px 1px 1px, rgba(9, 30, 66, 0.31) 0px 0px 1px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          padding: '30px 18px',
          backgroundColor: 'rgb(179, 212, 255)'
        }}
      >
        <img
          src="mockProjectAvatar.svg"
          alt={project.name}
          style={{
            width: '40px',
            height: '40px',
            marginRight: '12px',
            borderRadius: '3px'
          }}
        />

        <div>
          <span>{project.name}</span>
          <p style={{ margin: '0px' }}>{project.type}</p>
        </div>
      </div>

      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 18px'
        }}
      >
        <BoardIcon label="board" />
        <span style={{ marginLeft: '5px' }}>{project.key} board</span>
      </footer>
    </section>
  );
};
