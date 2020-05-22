import React, { useState } from 'react';
import { projectsMachine } from 'machines/projectsMachine';
import { useMachine } from '@xstate/react';
import Button from '@atlaskit/button';
import ProgressBar from '@atlaskit/progress-bar';
import Popup from '@atlaskit/popup';
import Drawer from '@atlaskit/drawer';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import InfoIcon from '@atlaskit/icon/glyph/info';
import { SomethingWentWrong } from 'shared/components/SomethingWentWrong';
import { ImpossibleStateNotice } from 'shared/components/ImpossibleStateNotice';

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

    const [open, setOpen] = useState(false);

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
                  <h1
                    style={{
                      fontWeight: 'normal',
                      marginBottom: '20px'
                    }}
                  >
                    Create project
                  </h1>

                  <Field name="projectName" defaultValue="" label="Name">
                    {({ fieldProps }) => (
                      <TextField
                        placeholder="Enter a project name"
                        autoFocus
                        {...fieldProps}
                      />
                    )}
                  </Field>

                  <Field name="projectKey" defaultValue="" label="Key">
                    {({ fieldProps }) => (
                      <div
                        style={{
                          display: 'flex',
                          alignContent: 'row',
                          alignItems: 'center',
                          width: '180px'
                        }}
                      >
                        <TextField {...fieldProps} />

                        <Popup
                          isOpen={open}
                          placement="right"
                          onClose={() => setOpen(false)}
                          zIndex={9999}
                          content={() => {
                            return (
                              <div
                                style={{
                                  width: '300px',
                                  padding: '16px 24px'
                                }}
                              >
                                <p style={{ marginBottom: '10px' }}>
                                  The project key is used as the prefix of your
                                  project's issue keys (e.g. 'TEST-100'). Choose
                                  one that is descriptive and easy to type.
                                </p>

                                <a
                                  href="https://support.atlassian.com/jira-core-cloud/docs/work-with-issues-in-jira-cloud/"
                                  target="_blank"
                                  rel="noreferrer noopener"
                                >
                                  Learn more
                                </a>
                              </div>
                            );
                          }}
                          trigger={(triggerProps) => {
                            return (
                              // @ts-ignore
                              <div
                                style={{
                                  marginLeft: '10px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => setOpen((v) => !v)}
                                {...triggerProps}
                              >
                                <InfoIcon
                                  label="More info"
                                  primaryColor="rgb(101, 84, 192)"
                                  size="medium"
                                />
                              </div>
                            );
                          }}
                        />
                      </div>
                    )}
                  </Field>

                  <Field name="template" defaultValue="kanban" label="Template">
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
};
