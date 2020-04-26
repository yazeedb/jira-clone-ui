import React, { FC } from 'react';
import { CreateOrgService, CreateOrgStates } from 'machines/createOrgMachine';
import { User } from 'shared/interfaces/User';
import { Formik, Form } from 'formik';
import { FormField } from 'shared/components/FormField';
import { useService } from '@xstate/react';
import { Notification } from 'shared/components/Notification';

interface CreateOrgProps {
  createOrgService: CreateOrgService;
  user: User;
}

export const CreateOrg: FC<CreateOrgProps> = ({ user, createOrgService }) => {
  const [current, send] = useService(createOrgService);

  return (
    <main className="confirm-org">
      <div className="container">
        <header>
          <img src="jira-logo.svg" alt="Jira Logo" className="jira-logo" />
        </header>

        <h1>One last step, {user.firstName}!</h1>

        <section className="form-section">
          <Formik
            initialValues={{ org: '' }}
            validate={(values) => {
              return {};
            }}
            onSubmit={(values) => {
              send({
                type: 'SUBMIT',
                formData: values
              });
            }}
          >
            {({ isValid }) => (
              <Form>
                <label htmlFor="org">What should your org's name be?</label>

                <FormField
                  name="org"
                  type="text"
                  placeholder="Org name"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={
                    !isValid || current.matches(CreateOrgStates.submitting)
                  }
                >
                  Create and go to projects
                </button>
              </Form>
            )}
          </Formik>
        </section>

        <footer>
          <img src="Atlassian-horizontal-blue-rgb.svg" alt="Atlassian Logo" />

          <span className="subtext">
            One account for Jira, Confluence, Trello and{' '}
            <a
              href="https://confluence.atlassian.com/cloud/your-atlassian-account-976161169.html"
              target="_blank"
              rel="noreferrer noopener"
            >
              more
            </a>
            .
          </span>
        </footer>

        <Notification
          handleClose={() => {
            send('CLEAR_ERROR');
          }}
          primaryMessage={current.context.errorMessage}
          secondaryMessage="Please try again"
          show={current.matches(CreateOrgStates.submitFailed)}
          type="error"
        />
      </div>
    </main>
  );
};
