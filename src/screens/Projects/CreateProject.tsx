import React, { FC, useState } from 'react';
import Popup from '@atlaskit/popup';
import Drawer from '@atlaskit/drawer';
import Form, { Field, ErrorMessage, ValidMessage } from '@atlaskit/form';
import { colors } from '@atlaskit/theme';
import TextField from '@atlaskit/textfield';
import InfoIcon from '@atlaskit/icon/glyph/info';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import Button from '@atlaskit/button';
import './CreateProject.scss';
import { validateName, validateKey } from './validateFields';
import { CreateProjectService } from 'machines/createProjectMachine';
import { useService } from '@xstate/react';
import Spinner from '@atlaskit/spinner';
import { Notification } from 'shared/components/Notification';

interface CreateProjectProps {
  isOpen: boolean;
  createProjectService: CreateProjectService;
}

export const CreateProject: FC<CreateProjectProps> = ({
  isOpen,
  createProjectService
}) => {
  const [current, send] = useService(createProjectService);
  const { errorMessage } = current.context;

  const [popupOpen, setPopupOpen] = useState(false);

  console.log('createProjectService:', current);

  return (
    <Drawer width="full" onClose={() => send('CLOSE')} isOpen={isOpen}>
      <div className="create-projects">
        <Form<FormFields>
          onSubmit={(data) =>
            send('SUBMIT', {
              projectName: data.projectName,
              projectKey: data.projectKey
            })
          }
        >
          {({ formProps, dirty, submitting, getValues }) => {
            return (
              <form {...formProps}>
                <h1 className="title">Create project</h1>

                <Field
                  name="projectName"
                  defaultValue=""
                  label="Name"
                  isRequired
                  validate={validateName}
                >
                  {({ fieldProps, error }) => (
                    <>
                      <div className="name-wrapper">
                        <TextField
                          placeholder="Enter a project name"
                          autoFocus
                          autoComplete="off"
                          className="name-input"
                          {...fieldProps}
                          onChange={(event) => {
                            fieldProps.onChange(event);

                            send('CHECK_NAME_TAKEN', {
                              projectName: getValues().projectName
                            });
                          }}
                          elemAfterInput={
                            <div className="after-input-wrapper">
                              {current.matches('nameNotAvailable') && (
                                <ErrorIcon
                                  primaryColor={colors.red()}
                                  label="warning"
                                />
                              )}

                              {current.matches('checkingNameTaken') && (
                                <Spinner size="medium" />
                              )}
                            </div>
                          }
                        />
                      </div>

                      {error && <ErrorMessage>{error}</ErrorMessage>}

                      {current.matches('nameNotAvailable') && (
                        <ErrorMessage>That name is taken</ErrorMessage>
                      )}

                      {current.matches('nameAvailable') && (
                        <ValidMessage>Project name available!</ValidMessage>
                      )}
                    </>
                  )}
                </Field>

                <Field
                  name="projectKey"
                  defaultValue=""
                  label="Key"
                  isRequired
                  validate={validateKey}
                >
                  {({ fieldProps, error }) => (
                    // TODO: Generate projectKey based on projectName
                    <>
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
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </>
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
                  isDisabled={!dirty}
                  isLoading={submitting}
                >
                  Create
                </Button>
              </form>
            );
          }}
        </Form>
      </div>

      <Notification
        type="error"
        primaryMessage={errorMessage}
        handleClose={() => send('CLEAR')}
        secondaryMessage="Please try again"
        show={current.matches('checkFailed')}
      />
    </Drawer>
  );
};

interface FormFields {
  projectName: string;
  projectKey: string;
}
