import React, { FC } from 'react';
import { Project } from 'shared/interfaces/Project';

interface ViewProjectsProps {
  projects: Project[];
}

export const ViewProjects: FC<ViewProjectsProps> = ({ projects }) => {
  const renderContent = () => {
    if (projects.length === 0) {
      return (
        <section className="no-projects">
          <img src="empty-folder.svg" alt="Empty folder image" />
          <h2>You currently have no projects</h2>
          <p>Let's create your first project in Jira</p>
          <button>Create project</button>
        </section>
      );
    }

    return projects.map((p) => JSON.stringify(p));
  };

  return (
    <section className="view-projects">
      <h1 className="title">Projects</h1>
      {renderContent()}
    </section>
  );
};
