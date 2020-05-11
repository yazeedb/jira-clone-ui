import React, { FC } from 'react';
import { ProjectsService } from 'machines/projectsMachine';
import { useService } from '@xstate/react';
import ProgressBar from '@atlaskit/progress-bar';

interface ViewProjectsProps {
  projectsService: ProjectsService;
}

export const ViewProjects: FC<ViewProjectsProps> = ({ projectsService }) => {
  const [current, send] = useService(projectsService);
  const { projects } = current.context;

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

  switch (true) {
    case current.matches('fetchingProjects'):
      return <ProgressBar isIndeterminate />;

    case current.matches('viewingProjects'):
      return (
        <section className="view-projects">
          <h1 className="title">Projects</h1>
          {renderContent()}
        </section>
      );

    default:
      console.error('Impossible state reached', current);
      return null;
  }
};
