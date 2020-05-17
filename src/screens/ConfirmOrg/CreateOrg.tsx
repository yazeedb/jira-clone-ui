import React, { FC } from 'react';
import { CreateOrgService, CreateOrgStates } from 'machines/createOrgMachine';
import { User } from 'shared/interfaces/User';
import { Formik, Form } from 'formik';
import { FormField } from 'shared/components/FormField';
import { useService } from '@xstate/react';
import { Notification } from 'shared/components/Notification';
import { ActionButton } from 'shared/ActionButton';
import { LandingForm } from 'shared/components/LandingForm';

interface CreateOrgProps {
  createOrgService: CreateOrgService;
  user: User;
}

export const CreateOrg: FC<CreateOrgProps> = ({ user, createOrgService }) => {
  const [current, send] = useService(createOrgService);

  return (
    <>
      <LandingForm containerClassName="confirm-org">
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
              <h4>What should your org's name be, {user.firstName}?</h4>

              <FormField
                name="org"
                type="text"
                placeholder="Org name"
                autoFocus
              />

              <ActionButton
                type="submit"
                disabled={
                  !isValid || current.matches(CreateOrgStates.submitting)
                }
              >
                Create and go to projects
              </ActionButton>
            </Form>
          )}
        </Formik>
      </LandingForm>
      <Notification
        handleClose={() => {
          send('CLEAR_ERROR');
        }}
        primaryMessage={current.context.errorMessage}
        secondaryMessage="Please try again"
        show={current.matches(CreateOrgStates.submitFailed)}
        type="error"
      />
    </>
  );
};
