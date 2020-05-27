import { Machine, Interpreter, assign, DoneInvokeEvent, spawn } from 'xstate';
import { fetcher, FetcherResponse } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { OrgsResponse } from 'shared/interfaces/Org';
import { ProjectResponseAvailableResponse } from 'shared/interfaces/Project';
import { validateName, validateKey } from 'screens/Projects/validateFields';
import {
  validationMachineFactory,
  MachineFactoryContext
} from './validationMachineFactory';

export const validateEvents = {
  name: 'VALIDATE_NAME',
  key: 'VALIDATE_KEY'
};

const nameValidationMachine = validationMachineFactory({
  inputGuard: (context) => validateName(context.value) === undefined,

  serviceGuard: (context, event) => {
    const e = event as DoneInvokeEvent<
      FetcherResponse<ProjectResponseAvailableResponse>
    >;

    return e.data.data.available;
  },

  validationService: (context, event) =>
    fetcher.get<OrgsResponse>(apiRoutes.orgs).then((response) => {
      // TODO: Support multiple orgs?
      // We're hardcoding the first one for now.
      const [firstOrg] = response.data.orgs;
      const { value } = context;

      return fetcher(apiRoutes.validateProjectName(firstOrg.id, value));
    }),

  validateEvent: validateEvents.name
});

const keyValidationMachine = validationMachineFactory({
  inputGuard: (context) => validateKey(context.value) === undefined,

  serviceGuard: (context, event) => {
    const e = event as DoneInvokeEvent<
      FetcherResponse<ProjectResponseAvailableResponse>
    >;

    return e.data.data.available;
  },

  validationService: (context, event) =>
    fetcher.get<OrgsResponse>(apiRoutes.orgs).then((response) => {
      // TODO: Support multiple orgs?
      // We're hardcoding the first one for now.
      const [firstOrg] = response.data.orgs;
      const { value } = context;

      return fetcher(apiRoutes.validateProjectName(firstOrg.id, value));
    }),

  validateEvent: validateEvents.key
});

interface MachineContext {
  nameValidationService: Interpreter<MachineFactoryContext>;
  keyValidationService: Interpreter<MachineFactoryContext>;
}
export type CreateProjectService = Interpreter<MachineContext>;
export const createProjectMachine = Machine<MachineContext>(
  {
    initial: 'editing',
    context: {
      nameValidationService: spawn(nameValidationMachine),
      keyValidationService: spawn(nameValidationMachine)
    },
    states: {
      editing: {
        entry: 'spawnValidationMachines'
      }
    }
  },
  {
    actions: {
      spawnValidationMachines: assign((context, event) => {
        return {
          nameValidationService: spawn(nameValidationMachine, {
            autoForward: true,
            name: 'nameValidation'
          }),
          keyValidationService: spawn(keyValidationMachine, {
            autoForward: true,
            name: 'keyValidation'
          })
        };
      })
    }
  }
);
