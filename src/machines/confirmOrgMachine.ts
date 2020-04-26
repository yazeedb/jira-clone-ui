import { Machine, assign, DoneInvokeEvent, Interpreter, spawn } from 'xstate';
import { createOrgMachine, CreateOrgService } from './createOrgMachine';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { Org } from 'shared/interfaces/Org';

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
        entry: 'spawnCreateOrgService',
        on: { ORG_CREATED: ConfirmOrgStates.orgConfirmed }
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
        const e = event as DoneInvokeEvent<OrgsResponse>;

        return userHasOrg(e.data.data.orgs);
      },
      userHasNoOrg: (_, event) => {
        const e = event as DoneInvokeEvent<OrgsResponse>;

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

interface OrgsResponse {
  data: { orgs: Org[] };
}

const userHasOrg = (orgs: Org[]) => orgs.length > 0;
