import React, { FC } from 'react';
import './ConfirmOrg.scss';
import { useService } from '@xstate/react';
import { User } from 'shared/interfaces/User';
import Spinner from '@atlaskit/spinner';
import {
  ConfirmOrgService,
  ConfirmOrgStates
} from 'machines/confirmOrgMachine';
import { CreateOrgStates } from 'machines/createOrgMachine';
import { Formik, Form } from 'formik';
import { FormField } from 'shared/components/FormField';
import Button from '@atlaskit/button';
import { colors } from '@atlaskit/theme';
import { LandingForm } from 'shared/components/LandingForm';

interface ConfirmOrgProps {
  confirmOrgService: ConfirmOrgService;
  user: User;
}

export const ConfirmOrg: FC<ConfirmOrgProps> = ({
  user,
  confirmOrgService
}) => {
  const [current] = useService(confirmOrgService);

  const renderFormBody = () => {
    switch (true) {
      case current.matches(ConfirmOrgStates.confirming):
        return (
          <>
            <h4 style={{ marginBottom: '15px' }}>Confirming org...</h4>
            <Spinner size="large" />
          </>
        );

      case current.matches(ConfirmOrgStates.confirmFailed):
        return (
          <>
            <h2
              style={{
                color: colors.R400,
                fontWeight: 'bold'
              }}
            >
              {current.context.errorMessage}
            </h2>
            <h3 style={{ fontWeight: 'normal' }}>Please try again later</h3>
          </>
        );

      case current.matches(ConfirmOrgStates.awaitingOrgCreation):
        return <TheForm />;
    }
  };

  const TheForm = () => {
    const [createOrgCurrent, send] = useService(
      current.context.createOrgService
    );

    return (
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
              isLoading={createOrgCurrent.matches(CreateOrgStates.submitting)}
              disabled={!isValid}
              shouldFitContainer
              appearance="primary"
            >
              Create and go to projects
            </Button>
          </Form>
        )}
      </Formik>
    );
  };

  return (
    <LandingForm containerClassName="confirm-org">
      {renderFormBody()}
    </LandingForm>
  );
};
