import React, { FC } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { User } from '../../App';
import './CompleteSignup.scss';
import { mapObject } from 'shared/utils/mapObject';
import { FormField } from 'shared/components/FormField';

interface CompleteSignupProps {
  user: User;
}

export const CompleteSignup: FC<CompleteSignupProps> = ({ user }) => {
  const fieldsWithEmptyStringDefaults = mapObject((value) => value || '', user);

  return (
    <main className="complete-signup">
      <div className="container">
        <header>
          <img src="jira-logo.svg" alt="Jira Logo" className="jira-logo" />
        </header>

        <section>
          <h5>Complete your profile</h5>

          <Formik
            initialValues={fieldsWithEmptyStringDefaults}
            validate={({ firstName, lastName }) => {
              return {
                firstName: !!firstName ? undefined : 'Required',
                lastName: !!lastName ? undefined : 'Required'
              };
            }}
            onSubmit={console.log}
          >
            {({ errors, touched, isValid, isSubmitting, values }) => (
              <Form>
                <Field type="email" name="email" disabled />

                <FormField
                  name="firstName"
                  type="text"
                  placeholder="First name"
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

                <button type="submit">Complete profile</button>
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
