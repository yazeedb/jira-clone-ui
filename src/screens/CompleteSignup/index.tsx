import React, { FC } from 'react';
import { Formik, Field, Form } from 'formik';
import { User } from '../../authMachine';
import './CompleteSignup.scss';
import { mapObject } from 'shared/utils/mapObject';
import { FormField } from 'shared/components/FormField';
import { useService } from '@xstate/react';
import { validateForm, SignupStates } from './signupMachine';

interface CompleteSignupProps {
  user: User;
  signupMachineActor: any;
}

export const CompleteSignup: FC<CompleteSignupProps> = ({
  user,
  signupMachineActor
}) => {
  const [current, send] = useService(signupMachineActor);
  const fieldsWithEmptyStringDefaults = mapObject((value) => value || '', user);

  return (
    <main className="complete-signup">
      <div className="container">
        <header>
          <img src="jira-logo.svg" alt="Jira Logo" className="jira-logo" />
        </header>

        <section>
          <h5>Complete your profile to continue</h5>

          <Formik
            initialValues={fieldsWithEmptyStringDefaults}
            validate={validateForm}
            onSubmit={(values) => {
              send({
                type: 'SUBMIT',

                // @ts-ignore
                formData: values
              });
            }}
          >
            {({ values, isValid }) => (
              <Form>
                <Field type="email" name="email" disabled />

                <FormField
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  autoFocus
                />

                <FormField
                  name="lastName"
                  placeholder="Last name"
                  type="text"
                />

                <FormField
                  type="text"
                  placeholder="Job title (optional)"
                  name="jobTitle"
                />

                <FormField
                  type="text"
                  placeholder="Department (optional)"
                  name="department"
                />

                <FormField
                  type="text"
                  placeholder="Organization (optional)"
                  name="organization"
                />

                <FormField
                  type="text"
                  placeholder="Location (optional)"
                  name="location"
                />

                <button
                  type="submit"
                  disabled={
                    !isValid || current.matches(SignupStates.submitting)
                  }
                >
                  Complete profile
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
      </div>
    </main>
  );
};
