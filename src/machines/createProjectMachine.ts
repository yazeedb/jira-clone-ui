import {
  Machine,
  sendParent,
  Interpreter,
  assign,
  DoneInvokeEvent
} from 'xstate';
import { fetcher, FetcherResponse } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { OrgsResponse } from 'shared/interfaces/Org';
import { ProjectNameAvailableResponse } from 'shared/interfaces/Project';

interface MachineContext {
  projectNameAvailable: boolean;
  errorMessage: string;
}

export type CreateProjectService = Interpreter<MachineContext>;
export const createProjectMachine = Machine<MachineContext>(
  {
    initial: 'editing',
    context: {
      projectNameAvailable: false,
      errorMessage: ''
    },
    on: {
      CLOSE: { actions: sendParent('CLOSE') }
    },
    states: {
      editing: {
        on: { CHECK_NAME_TAKEN: 'checkingNameTaken' }
      },
      checkingNameTaken: {
        entry: 'makeNameUnavailable',
        invoke: {
          src: 'checkNameTaken',
          onDone: [
            {
              target: 'editing',
              actions: 'setNameAvailability',
              cond: 'nameIsAvailable'
            },
            {
              target: 'editing',
              actions: 'setNameAvailability',
              cond: 'nameNotAvailable'
            }
          ],
          onError: {
            target: 'editing',
            actions: 'setErrorMessage'
          }
        }
      }
    }
  },
  {
    services: {
      checkNameTaken: (context, event) =>
        fetcher.get<OrgsResponse>(apiRoutes.orgs).then((response) => {
          // TODO: Support multiple orgs?
          // We're hardcoding the first one for now.
          const [firstOrg] = response.data.orgs;
          const { projectName } = event;

          return fetcher(
            apiRoutes.validateProjectName(firstOrg.id, projectName)
          );
        })
    },
    actions: {
      makeNameAvailable: setNameAvailability(true),
      makeNameUnavailable: setNameAvailability(false)
    },
    guards: {
      nameIsAvailable: createNameCheck(true),
      nameNotAvailable: createNameCheck(false)
    }
  }
);

function setNameAvailability(available: boolean) {
  return assign((context: MachineContext, event: any) => {
    return {
      projectNameAvailable: available
    };
  });
}

function createNameCheck(available: boolean) {
  return (context: MachineContext, event: any) => {
    const e = event as DoneInvokeEvent<
      FetcherResponse<ProjectNameAvailableResponse>
    >;

    return e.data.data.available === false;
  };
}
