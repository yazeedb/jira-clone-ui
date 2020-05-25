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
import { validateName } from 'screens/Projects/validateFields';

interface MachineContext {
  errorMessage: string;
}

export type CreateProjectService = Interpreter<MachineContext>;
export const createProjectMachine = Machine<MachineContext>(
  {
    initial: 'idle',
    context: {
      errorMessage: ''
    },
    on: {
      CHECK_NAME_TAKEN: {
        target: 'debounceNameCheck',
        cond: 'isValidName'
      },
      CLOSE: { actions: sendParent('CLOSE') }
    },
    states: {
      idle: {},
      debounceNameCheck: {
        // PICK UP HERE:
        // Debounced transition swallows user input
        // Either forward input, used setTimeout, etc?
      },
      checkingNameTaken: {
        invoke: {
          src: 'checkNameTaken',
          onDone: [
            {
              target: 'nameAvailable',
              cond: 'nameIsAvailable'
            },
            {
              target: 'nameNotAvailable',
              cond: 'nameNotAvailable'
            }
          ],
          onError: {
            target: 'idle',
            actions: 'setErrorMessage'
          }
        }
      },
      nameAvailable: {},
      nameNotAvailable: {}
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

          debugger;

          return fetcher(
            apiRoutes.validateProjectName(firstOrg.id, projectName)
          );
        })
    },
    guards: {
      nameIsAvailable: createNameCheck(true),

      nameNotAvailable: createNameCheck(false),

      isValidName: (context: MachineContext, event: any) =>
        validateName(event.projectName) === undefined
    }
  }
);

function createNameCheck(available: boolean) {
  return (context: MachineContext, event: any) => {
    const e = event as DoneInvokeEvent<
      FetcherResponse<ProjectNameAvailableResponse>
    >;

    return e.data.data.available === available;
  };
}
