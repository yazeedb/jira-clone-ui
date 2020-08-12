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

  const [_, send] = useService(current.context.createOrgService);

  const renderFormBody = () => {
    switch (true) {
      case current.matches(ConfirmOrgStates.confirming):
        return (
          <>
            <h4 style={{ marginBottom: '10px' }}>Confirming org...</h4>
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
        );
    }
  };

  return (
    <LandingForm containerClassName="confirm-org">
      {renderFormBody()}
    </LandingForm>
  );

  // switch (true) {
  //   case current.matches(ConfirmOrgStates.awaitingOrgCreation):
  //     return (
  //       <CreateOrg
  //         createOrgService={current.context.createOrgService}
  //         user={user}
  //       />
  //     );

  //   case current.matches(ConfirmOrgStates.confirming):
  //     return <h1>I am here!!</h1>;
  //   // return <Spinner size="xlarge" />;

  //   case current.matches(ConfirmOrgStates.orgConfirmed):
  //     return <h1>Confirmed!</h1>;

  //   case current.matches(ConfirmOrgStates.confirmFailed):
  //     return <h1>Failure: {current.context.errorMessage}</h1>;

  //   default:
  //     console.error('Impossible state reached', current);
  //     return null;
  // }
};
