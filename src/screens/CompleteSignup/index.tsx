import React, { FC } from 'react';
import { Formik, Field, Form } from 'formik';
import './CompleteSignup.scss';
import { mapObject } from 'shared/utils/mapObject';
import { FormField } from 'shared/components/FormField';
import Button from '@atlaskit/button';
import { useService } from '@xstate/react';
import {
  validateForm,
  SignupStates,
  SignupContext,
  SignupStateSchema,
  SignupEvent
} from 'machines/signupMachine';
import { User } from 'shared/interfaces/User';
import { Interpreter } from 'xstate';
import { LandingForm } from 'shared/components/LandingForm';
import { Notification } from 'shared/components/Notification';

interface CompleteSignupProps {
  signupService: Interpreter<SignupContext, SignupStateSchema, SignupEvent>;
  user: User;
}

export const CompleteSignup: FC<CompleteSignupProps> = ({
  user,
  signupService
}) => {
  const [current, send] = useService(signupService);
  const { context } = current;

  const fieldsWithEmptyStringDefaults = mapObject((value) => value || '', user);

  console.log('CompleteSignup', current);

  return (
    <>
      <LandingForm containerClassName="complete-signup">
        <h4 className="heading">Complete your profile to continue</h4>

        <Formik
          initialValues={fieldsWithEmptyStringDefaults}
          validate={validateForm}
          onSubmit={(values) => {
            send({
              type: 'SUBMIT',
              formData: values
            });
          }}
        >
          {({ isValid }) => (
            <Form>
              <Field type="email" name="email" disabled />

              <FormField
                name="firstName"
                type="text"
                placeholder="First name"
                autoFocus
              />

              <FormField name="lastName" placeholder="Last name" type="text" />

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

              <Button
                type="submit"
                isLoading={current.matches(SignupStates.submitting)}
                isDisabled={!isValid}
                appearance="primary"
                shouldFitContainer
              >
                Complete profile
              </Button>
            </Form>
          )}
        </Formik>
      </LandingForm>
      <Notification
        show={current.matches(SignupStates.fail)}
        primaryMessage={context.errorMessage}
        handleClose={() => send('CLEAR_ERROR')}
        type="error"
        secondaryMessage="Please try again"
      />
    </>
  );
};
