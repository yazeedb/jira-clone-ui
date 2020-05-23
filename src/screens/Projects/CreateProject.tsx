import React, { FC, useState } from 'react';
import Popup from '@atlaskit/popup';
import Drawer from '@atlaskit/drawer';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import InfoIcon from '@atlaskit/icon/glyph/info';
import Button from '@atlaskit/button';
import './CreateProject.scss';

interface CreateProjectProps {
  onClose: () => void;
  isOpen: boolean;
}

export const CreateProject: FC<CreateProjectProps> = ({ onClose, isOpen }) => {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <Drawer width="full" onClose={onClose} isOpen={isOpen}>
      <div className="create-projects">
        <Form onSubmit={(data) => console.log('form data', data)}>
          {({ formProps, dirty, submitting }) => {
            return (
              <form {...formProps}>
                <h1 className="title">Create project</h1>

                <Field
                  name="projectName"
                  defaultValue=""
                  label="Name"
                  isRequired
                >
                  {({ fieldProps }) => (
                    <TextField
                      placeholder="Enter a project name"
                      autoFocus
                      {...fieldProps}
                    />
                  )}
                </Field>

                <Field name="projectKey" defaultValue="" label="Key" isRequired>
                  {({ fieldProps }) => (
                    <div className="flex-wrapper">
                      <TextField {...fieldProps} />

                      <Popup
                        isOpen={popupOpen}
                        placement="right"
                        onClose={() => setPopupOpen(false)}
                        content={() => {
                          return (
                            <div className="popup-wrapper">
                              <p>
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
                            <Button
                              className="popup-trigger"
                              style={{
                                marginLeft: '10px',
                                cursor: 'pointer',
                                background: 'none'
                              }}
                              onClick={() => setPopupOpen((v) => !v)}
                              {...triggerProps}
                            >
                              <InfoIcon
                                label="More info"
                                primaryColor="rgb(101, 84, 192)"
                                size="medium"
                              />
                            </Button>
                          );
                        }}
                        zIndex={999} // Otherwise it won't show above the Drawer -_-"
                      />
                    </div>
                  )}
                </Field>

                <Field name="template" defaultValue="kanban" label="Template">
                  {() => (
                    <div className="template-wrapper">
                      <img src="kanban-template.svg" alt="Kanban template" />

                      <div>
                        <h4>Kanban</h4>
                        <p>
                          Visualize and progress your project using simple cards
                          on a powerful board
                        </p>
                      </div>
                    </div>
                  )}
                </Field>

                <Button
                  type="submit"
                  appearance="primary"
                  shouldFitContainer
                  isDisabled={!dirty || submitting}
                >
                  Create
                </Button>
              </form>
            );
          }}
        </Form>
      </div>
    </Drawer>
  );
};
