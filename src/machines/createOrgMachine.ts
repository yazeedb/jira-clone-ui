import {
  Machine,
  assign,
  DoneInvokeEvent,
  sendParent,
  Interpreter
} from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';

export enum CreateOrgStates {
  editing = 'editing',
  submitting = 'submitting',
  success = 'success',
  submitFailed = 'submitFailed'
}

type FormFields = { org: string };

interface MachineContext {
  formData: FormFields;
  errorMessage: string;
}

type SubmitEvent = { type: 'SUBMIT'; formData: FormFields };
type ClearErrorEvent = { type: 'CLEAR_ERROR' };
type RetryEvent = { type: 'RETRY' };

type MachineEvent = SubmitEvent | ClearErrorEvent | RetryEvent;

export type CreateOrgService = Interpreter<MachineContext, any, MachineEvent>;

export const createOrgMachine = Machine<MachineContext, any, MachineEvent>(
  {
    initial: CreateOrgStates.editing,
    context: {
      formData: { org: '' },
      errorMessage: ''
    },
    states: {
      editing: {
        on: {
          SUBMIT: {
            target: 'submitting',
            actions: 'updateFormData',
            cond: 'formIsValid'
          }
        }
      },
      submitting: {
        invoke: {
          src: 'createOrg',
          onDone: {
            target: CreateOrgStates.success,
            actions: sendParent('ORG_CREATED')
          },
          onError: {
            target: CreateOrgStates.submitFailed,
            actions: 'updateErrorMessage'
          }
        }
      },
      submitFailed: {
        after: { 5000: CreateOrgStates.editing },
        on: {
          CLEAR_ERROR: CreateOrgStates.editing,
          RETRY: {
            target: CreateOrgStates.submitting,
            cond: 'formIsValid'
          }
        }
      },
      success: { type: 'final' }
    }
  },
  {
    services: {
      createOrg: (context, event) =>
        fetcher({
          url: apiRoutes.orgs,
          method: 'POST',
          data: context.formData
        })
    },
    actions: {
      updateFormData: assign({
        formData: (_, event) => {
          const e = event as SubmitEvent;

          return e.formData;
        }
      }),
      updateErrorMessage: assign({
        errorMessage: (_, event) => {
          const e = event as DoneInvokeEvent<Error>;

          return e.data.message;
        }
      })
    },
    guards: {
      formIsValid: (context, event) => true
    }
  }
);
