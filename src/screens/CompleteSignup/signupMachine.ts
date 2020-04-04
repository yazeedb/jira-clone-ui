import { Machine, assign, sendParent } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { User } from 'shared/interfaces/User';

export const validateForm = ({ firstName, lastName }: User) => {
  interface FormErrors {
    firstName?: string;
    lastName?: string;
  }

  const result: FormErrors = {};

  if (!firstName) {
    result.firstName = 'Required';
  }

  if (!lastName) {
    result.lastName = 'Required';
  }

  return result;
};

export enum SignupStates {
  editing = 'editing',
  submitting = 'submitting',
  fail = 'fail',
  success = 'success'
}

interface SignupStateSchema {
  states: {
    [SignupStates.editing]: {};
    [SignupStates.submitting]: {};
    [SignupStates.fail]: {};
    [SignupStates.success]: {};
  };
}

type SignupEvent =
  | {
      type: 'SUBMIT';
      formData: User;
    }
  | {
      type: 'FAIL';
      error: string;
    }
  | {
      type: 'SUCCESS';
    };

interface SignupContext {
  formData: User | {};
  errorMessage: string;
}

export const signupMachine = Machine<
  SignupContext,
  SignupStateSchema,
  SignupEvent
>({
  initial: SignupStates.editing,
  context: {
    formData: {},
    errorMessage: ''
  },
  states: {
    editing: {
      on: {
        SUBMIT: {
          target: SignupStates.submitting,
          actions: assign({
            formData: (context, event) => event.formData
          }),
          cond: (_, event) =>
            Object.keys(validateForm(event.formData)).length === 0
        }
      }
    },
    submitting: {
      invoke: {
        src: (context, event) =>
          fetcher({
            url: apiRoutes.completeSignup,
            method: 'POST',
            data: context.formData
          }),
        onDone: {
          target: SignupStates.success,
          actions: sendParent((context: SignupContext) => ({
            type: 'SIGNUP_COMPLETE',
            user: context.formData
          }))
        },
        onError: {
          target: SignupStates.fail,
          actions: assign({
            errorMessage: (_, event) => event.data
          })
        }
      }
    },
    fail: {
      after: { 5000: SignupStates.editing }
    },
    success: {}
  }
});
