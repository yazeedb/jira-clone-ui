import { Machine, assign, DoneInvokeEvent } from 'xstate';
import { createOrgMachine } from './createOrgMachine';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { Org } from 'shared/interfaces/Org';

export enum ConfirmOrgStates {
  confirming = 'confirming',
  orgConfirmed = 'orgConfirmed',
  awaitingOrgCreation = 'awaitingOrgCreation',
  confirmFailed = 'confirmFailed'
}

export const confirmOrgMachine = Machine(
  {
    initial: ConfirmOrgStates.confirming,
    context: { errorMessage: '' },
    states: {
      confirming: {
        invoke: {
          src: 'checkUserOrgs',
          onDone: [
            {
              target: ConfirmOrgStates.orgConfirmed,
              cond: 'userHasOrg'
            },
            {
              target: ConfirmOrgStates.awaitingOrgCreation,
              cond: 'userHasNoOrg'
            }
          ],
          onError: {
            target: ConfirmOrgStates.confirmFailed,
            actions: 'updateErrorMessage'
          }
        }
      },
      awaitingOrgCreation: {
        invoke: {
          src: createOrgMachine,
          onDone: ConfirmOrgStates.orgConfirmed
        }
      },
      orgConfirmed: { type: 'final' },
      confirmFailed: {
        on: { RETRY: ConfirmOrgStates.confirming }
      }
    }
  },
  {
    services: {
      checkUserOrgs: () => fetcher(apiRoutes.orgs)
    },
    guards: {
      userHasOrg: (_, event) => {
        const e = event as DoneInvokeEvent<OrgsResponse>;

        return userHasOrg(e.data.data.orgs);
      },
      userHasNoOrg: (_, event) => {
        const e = event as DoneInvokeEvent<OrgsResponse>;

        return !userHasOrg(e.data.data.orgs);
      }
    },
    actions: {
      updateErrorMessage: assign({
        errorMessage: (_, event) => {
          const e = event as DoneInvokeEvent<Error>;

          return e.data.message;
        }
      })
    }
  }
);

interface OrgsResponse {
  data: { orgs: Org[] };
}

const userHasOrg = (orgs: Org[]) => orgs.length > 0;
