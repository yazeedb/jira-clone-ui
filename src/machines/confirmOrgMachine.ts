import {
  Machine,
  assign,
  DoneInvokeEvent,
  Interpreter,
  spawn,
  sendParent
} from 'xstate';
import { createOrgMachine, CreateOrgService } from './createOrgMachine';
import { fetcher, FetcherResponse } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { Org, OrgsResponse } from 'shared/interfaces/Org';

export enum ConfirmOrgStates {
  confirming = 'confirming',
  orgConfirmed = 'orgConfirmed',
  awaitingOrgCreation = 'awaitingOrgCreation',
  confirmFailed = 'confirmFailed'
}

interface MachineContext {
  errorMessage: string;
  createOrgService: CreateOrgService;
}

export type ConfirmOrgService = Interpreter<MachineContext, any, any>;

export const confirmOrgMachine = Machine<MachineContext, any, any>(
  {
    initial: ConfirmOrgStates.confirming,
    context: {
      errorMessage: '',
      createOrgService: spawn(createOrgMachine)
    },
    states: {
      confirming: {
        invoke: {
          src: 'checkUserOrgs',
          onDone: [
            {
              target: ConfirmOrgStates.orgConfirmed,
              cond: 'userHasOrg',
              actions: sendParent('ORG_CONFIRMED')
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
        entry: 'spawnCreateOrgService',
        on: {
          ORG_CREATED: {
            target: ConfirmOrgStates.orgConfirmed,
            actions: sendParent('ORG_CONFIRMED')
          }
        }
      },
      confirmFailed: {
        on: { RETRY: ConfirmOrgStates.confirming }
      },
      orgConfirmed: { type: 'final' }
    }
  },
  {
    services: {
      checkUserOrgs: () => fetcher(apiRoutes.orgs)
    },
    guards: {
      userHasOrg: (_, event) => {
        const e = event as DoneInvokeEvent<FetcherResponse<OrgsResponse>>;

        return userHasOrg(e.data.data.orgs);
      },
      userHasNoOrg: (_, event) => {
        const e = event as DoneInvokeEvent<FetcherResponse<OrgsResponse>>;

        return !userHasOrg(e.data.data.orgs);
      }
    },
    actions: {
      spawnCreateOrgService: assign({
        createOrgService: (context, event) => spawn(createOrgMachine)
      }),
      updateErrorMessage: assign({
        errorMessage: (_, event) => {
          const e = event as DoneInvokeEvent<Error>;

          return e.data.message;
        }
      })
    }
  }
);

const userHasOrg = (orgs: Org[]) => orgs.length > 0;
