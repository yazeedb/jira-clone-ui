import React, { FC } from 'react';
import { ProjectsService } from 'machines/projectsMachine';
import { useService } from '@xstate/react';
import Button from '@atlaskit/button';
import ProgressBar from '@atlaskit/progress-bar';
import { SomethingWentWrong } from 'shared/components/SomethingWentWrong';
import { ImpossibleStateNotice } from 'shared/components/ImpossibleStateNotice';

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
          <h3>You currently have no projects</h3>
          <p>Let's create your first project in Jira</p>
          <Button appearance="primary">Create project</Button>
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
          <h2 className="title">Projects</h2>
          {renderContent()}
        </section>
      );

    case current.matches('fetchProjectsFailed'):
      return <SomethingWentWrong />;

    default:
      console.error('Impossible state reached', current);
      return <ImpossibleStateNotice />;
  }
};
