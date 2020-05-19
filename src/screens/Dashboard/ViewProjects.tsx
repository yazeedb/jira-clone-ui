import React, { FC } from 'react';
import { ProjectsService } from 'machines/projectsMachine';
import { useService } from '@xstate/react';
import Button from '@atlaskit/button';
import ProgressBar from '@atlaskit/progress-bar';
import Drawer from '@atlaskit/drawer';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { SomethingWentWrong } from 'shared/components/SomethingWentWrong';
import { ImpossibleStateNotice } from 'shared/components/ImpossibleStateNotice';

interface ViewProjectsProps {
  projectsService: ProjectsService;
}

export const ViewProjects: FC<ViewProjectsProps> = ({ projectsService }) => {
  const [current, send] = useService(projectsService);
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

  switch (true) {
    case current.matches('fetchingProjects'):
      return <ProgressBar isIndeterminate />;

    case current.matches('viewingProjects'): {
      return (
        <section className="view-projects">
          <h2 className="title">Projects</h2>
          {renderContent()}

          <Drawer
            onClose={() => send('CLOSE')}
            isOpen={current.matches('viewingProjects.creatingProject')}
            width="full"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%'
              }}
            >
              <Form onSubmit={(data) => console.log('form data', data)}>
                {({ formProps }) => (
                  <form
                    style={{
                      width: '350px',
                      margin: '0 auto'
                    }}
                    {...formProps}
                  >
                    <h1 style={{ fontWeight: 'normal', marginBottom: '20px' }}>
                      Create project
                    </h1>

                    <Field name="projectName" defaultValue="" label="Name">
                      {({ fieldProps }) => (
                        <TextField
                          placeholder="Enter a project name"
                          {...fieldProps}
                        />
                      )}
                    </Field>

                    <Field name="projectKey" defaultValue="" label="Key">
                      {({ fieldProps }) => <TextField {...fieldProps} />}
                    </Field>

                    <Field
                      name="template"
                      defaultValue="kanban"
                      label="Template"
                    >
                      {() => (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                        >
                          <img
                            src="kanban-template.svg"
                            alt="Kanban template"
                            style={{
                              width: '150px',
                              marginRight: '10px'
                            }}
                          />

                          <div>
                            <h4>Kanban</h4>
                            <p style={{ color: 'rgb(107, 119, 140)' }}>
                              Visualize and progress your project using simple
                              cards on a powerful board
                            </p>
                          </div>
                        </div>
                      )}
                    </Field>

                    <Button
                      type="submit"
                      appearance="primary"
                      shouldFitContainer
                      style={{
                        marginTop: '25px',
                        height: '40px'
                      }}
                    >
                      Create
                    </Button>
                  </form>
                )}
              </Form>
            </div>
          </Drawer>
        </section>
      );
    }

    case current.matches('fetchProjectsFailed'):
      return <SomethingWentWrong title={current.context.errorMessage} />;

    default:
      console.error('Impossible state reached', current);
      return <ImpossibleStateNotice />;
  }
};
