import React, { FC } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { User } from '../../App';
import './CompleteSignup.scss';
import { mapObject } from 'shared/utils/mapObject';

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
                {console.log(values)}

                <Field type="text" placeholder="First name" name="firstName" />
                <ErrorMessage
                  name="firstName"
                  component="div"
                  className="form-error"
                />

                <Field type="text" placeholder="Last name" name="lastName" />
                <ErrorMessage
                  name="lastName"
                  component="div"
                  className="form-error"
                />

                <Field
                  type="text"
                  placeholder="Job title (optional)"
                  name="jobTitle"
                />
                <Field
                  type="text"
                  placeholder="Department (optional)"
                  name="department"
                />
                <Field
                  type="text"
                  placeholder="Organization (optional)"
                  name="organization"
                />
                <Field
                  type="text"
                  placeholder="Location (optional)"
                  name="location"
                />

                <button type="submit" disabled={!isValid || isSubmitting}>
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
