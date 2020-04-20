import { Machine, assign, DoneInvokeEvent } from 'xstate';

export enum CreateOrgStates {
  editing = 'editing',
  submitting = 'submitting',
  success = 'success',
  submitFailed = 'submitFailed'
}

type FormFields = { org: string };

type SubmitEvent = { type: 'SUBMIT'; formData: FormFields };

export const createOrgMachine = Machine(
  {
    initial: CreateOrgStates.editing,
    context: {
      formData: {
        org: ''
      },
      errorMessage: ''
    },
    states: {
      editing: {
        on: {
          SUBMIT: {
            actions: 'updateFormData',
            cond: 'formIsValid'
          }
        }
      },
      submitting: {
        invoke: {
          src: 'createOrg',
          onDone: CreateOrgStates.success,
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
    }
  }
);
