import React from 'react';
import { projectsMachine } from 'machines/projectsMachine';
import { useMachine } from '@xstate/react';
import Button from '@atlaskit/button';
import ProgressBar from '@atlaskit/progress-bar';
import { SomethingWentWrong } from 'shared/components/SomethingWentWrong';
import { ImpossibleStateNotice } from 'shared/components/ImpossibleStateNotice';
import { CreateProject } from './CreateProject';

export const Projects = () => {
  const [current, send] = useMachine(projectsMachine);

  console.log('Projects current:', current);

  switch (true) {
    case current.matches('fetchingProjects'):
      return <ProgressBar isIndeterminate />;

    case current.matches('fetchFailed'):
      return <SomethingWentWrong />;

    case current.matches('viewingProjects'):
      return <ViewProjects />;

    default:
      console.error('Impossible state reached', current);
      return <ImpossibleStateNotice />;
  }

  function ViewProjects() {
    const { projects } = current.context;

    console.log('ViewProjects current:', current);

    const renderContent = () => {
      if (projects.length === 0) {
        return (
          <section className="no-projects">
            <img src="empty-folder.svg" alt="Empty folder image" />
            <h3>You currently have no projects</h3>
            <p>Let's create your first project in Jira</p>
            <Button onClick={() => send('CREATE_PROJECT')} appearance="primary">
              Create project
            </Button>
          </section>
        );
      }

      return projects.map((p) => JSON.stringify(p));
    };

    return (
      <section className="view-projects">
        <h2 className="title">Projects</h2>
        {renderContent()}

        <CreateProject
          isOpen={current.matches('viewingProjects.creatingProject')}
          onClose={() => send('CLOSE')}
        />
      </section>
    );
  }
};
