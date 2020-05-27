import React, { FC } from 'react';
import './ConfirmOrg.scss';
import { useService } from '@xstate/react';
import { User } from 'shared/interfaces/User';
import Spinner from '@atlaskit/spinner';
import {
  ConfirmOrgService,
  ConfirmOrgStates
} from 'machines/confirmOrgMachine';
import { CreateOrg } from './CreateOrg';

interface ConfirmOrgProps {
  confirmOrgService: ConfirmOrgService;
  user: User;
}

export const ConfirmOrg: FC<ConfirmOrgProps> = ({
  user,
  confirmOrgService
}) => {
  const [current] = useService(confirmOrgService);

  console.log('ConfirmOrg', current);

  switch (true) {
    case current.matches(ConfirmOrgStates.awaitingOrgCreation):
      return (
        <CreateOrg
          createOrgService={current.context.createOrgService}
          user={user}
        />
      );

    case current.matches(ConfirmOrgStates.confirming):
      return <Spinner size="xlarge" />;

    case current.matches(ConfirmOrgStates.orgConfirmed):
      return <h1>Confirmed!</h1>;

    case current.matches(ConfirmOrgStates.confirmFailed):
      return <h1>Failure: {current.context.errorMessage}</h1>;

    default:
      console.error('Impossible state reached', current);
      return null;
  }
};
