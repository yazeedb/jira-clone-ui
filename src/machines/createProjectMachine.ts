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
  projectName: string;
  errorMessage: string;
}

export type CreateProjectService = Interpreter<MachineContext>;
export const createProjectMachine = Machine<MachineContext>(
  {
    initial: 'idle',
    context: {
      projectName: '',
      errorMessage: ''
    },
    on: {
      CHECK_NAME_TAKEN: { target: 'debounceNameCheck' },
      CLOSE: { actions: sendParent('CLOSE') }
    },
    states: {
      idle: {},
      debounceNameCheck: {
        entry: 'setProjectName',
        after: {
          300: {
            target: 'checkingNameTaken',
            cond: 'isValidName'
          }
        }
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
            target: 'checkFailed',
            actions: 'setErrorMessage'
          }
        }
      },
      nameAvailable: {},
      nameNotAvailable: {},
      checkFailed: {
        after: { 3000: 'idle' },
        on: { CLEAR: 'idle' }
      }
    }
  },
  {
    actions: {
      setProjectName: assign((context, event) => {
        return {
          projectName: event.projectName
        };
      }),
      setErrorMessage: assign((context, event) => {
        const e = event as DoneInvokeEvent<Error>;

        return {
          errorMessage: e.data.message
        };
      })
    },
    services: {
      checkNameTaken: (context, event) =>
        fetcher.get<OrgsResponse>(apiRoutes.orgs).then((response) => {
          // TODO: Support multiple orgs?
          // We're hardcoding the first one for now.
          const [firstOrg] = response.data.orgs;
          const { projectName } = context;

          return fetcher(
            apiRoutes.validateProjectName(firstOrg.id, projectName)
          );
        })
    },
    guards: {
      nameIsAvailable: createNameCheck(true),

      nameNotAvailable: createNameCheck(false),

      isValidName: (context: MachineContext, event: any) =>
        validateName(context.projectName) === undefined
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
