import { Machine, assign, DoneInvokeEvent, spawn } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { Org, OrgsResponse } from 'shared/interfaces/Org';
import { ProjectsService, projectsMachine } from './projectsMachine';

interface MachineContext {
  orgs: Org[];
  orgsErrorMessage: string;
  projectsService: ProjectsService;
}

export const dashboardMachine = Machine<MachineContext>(
  {
    id: 'dashboard',
    initial: 'fetchingOrgs',
    context: {
      orgs: [],
      orgsErrorMessage: '',
      projectsService: spawn(projectsMachine)
    },
    states: {
      fetchingOrgs: {
        invoke: {
          src: 'fetchOrgs',
          onDone: {
            target: 'receivedOrgs',
            actions: 'spawnProjectsService'
          },
          onError: {
            target: 'fetchOrgFailed',
            actions: 'updateorgsErrorMessage'
          }
        }
      },
      receivedOrgs: {},
      fetchOrgFailed: {
        on: { RETRY: 'fetchingOrgs' }
      }
    }
  },
  {
    services: {
      fetchOrgs: () => fetcher(apiRoutes.orgs)
    },
    actions: {
      spawnProjectsService: assign((context, event) => {
        const e = event as DoneInvokeEvent<OrgsResponse>;
        const { orgs } = e.data.data;

        return {
          orgs,
          projectsService: spawn(
            projectsMachine.withContext({
              orgs: e.data.data.orgs,
              projects: [],
              errorMessage: ''
            })
          )
        };
      }),
      updateorgsErrorMessage: assign({
        orgsErrorMessage: (context, event) => {
          const e = event as DoneInvokeEvent<Error>;

          return e.data.message;
        }
      })
    }
  }
);
