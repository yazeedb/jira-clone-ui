import React, { FC } from 'react';
import { CreateOrgService, CreateOrgStates } from 'machines/createOrgMachine';
import { User } from 'shared/interfaces/User';
import { Formik, Form } from 'formik';
import { FormField } from 'shared/components/FormField';
import { useService } from '@xstate/react';
import Button from '@atlaskit/button';
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
            // TODO: Validate this form
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

              <Button
                type="submit"
                isLoading={current.matches(CreateOrgStates.submitting)}
                disabled={!isValid}
                shouldFitContainer
                appearance="primary"
              >
                Create and go to projects
              </Button>
            </Form>
          )}
        </Formik>
      </LandingForm>
    </>
  );
};
