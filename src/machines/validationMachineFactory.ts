import { Machine, assign, sendUpdate } from 'xstate';

export interface MachineFactoryContext {
  value: string;
  errorMessage: string;
}

type Config = {
  inputGuard: (context: MachineFactoryContext, event: any) => boolean;
  serviceGuard: (context: MachineFactoryContext, event: any) => boolean;
  validationService: (
    context: MachineFactoryContext,
    event: any
  ) => Promise<any>;
  validateEvent: string;
};

export function validationMachineFactory({
  inputGuard,
  serviceGuard,
  validationService,
  validateEvent
}: Config) {
  return Machine<MachineFactoryContext>(
    {
      id: 'validation',
      initial: 'editing',
      context: {
        value: '',
        errorMessage: ''
      },
      on: {
        [validateEvent]: {
          target: 'debounceValidation',
          actions: ['setValue', 'clearErrorMessage', 'sendUpdate']
        }
      },
      states: {
        editing: {},
        debounceValidation: {
          after: {
            500: [
              {
                target: 'validating',
                cond: 'isValidInput',
                actions: 'sendUpdate'
              },
              {
                target: 'editing',
                cond: 'isNotValidInput',
                actions: 'sendUpdate'
              }
            ]
          }
        },
        validating: {
          invoke: {
            src: 'validationService',
            onDone: [
              {
                target: 'available',
                cond: 'isAvailable',
                actions: 'sendUpdate'
              },
              {
                target: 'notAvailable',
                cond: 'isNotAvailable',
                actions: 'sendUpdate'
              }
            ],
            onError: {
              target: 'editing',
              actions: ['setErrorMessage', 'sendUpdate']
            }
          }
        },
        available: {},
        notAvailable: {}
      }
    },
    {
      actions: {
        sendUpdate: sendUpdate(),
        setValue: assign({
          value: (context, event) => event.value
        }),
        setErrorMessage: assign({
          errorMessage: (context, event) => event.data.message
        }),
        clearErrorMessage: assign({
          errorMessage: (context, event) => ''
        })
      },
      services: { validationService },
      guards: {
        isAvailable: (context, event) => serviceGuard(context, event),
        isNotAvailable: (context, event) => !serviceGuard(context, event),

        isValidInput: (context, event) => inputGuard(context, event),
        isNotValidInput: (context, event) => !inputGuard(context, event)
      }
    }
  );
}
