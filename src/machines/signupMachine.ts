import {
  Machine,
  assign,
  Interpreter,
  DoneInvokeEvent,
  sendParent
} from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { User } from 'shared/interfaces/User';
import { Optional } from 'shared/interfaces/Optional';

type SignupFields = Optional<User>;

export const validateForm = (fields: User) => {
  const { firstName, lastName } = fields;
  const result: SignupFields = {};

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

export interface SignupStateSchema {
  states: {
    [SignupStates.editing]: {};
    [SignupStates.submitting]: {};
    [SignupStates.fail]: {};
    [SignupStates.success]: {};
  };
}

type SubmitEvent = {
  type: 'SUBMIT';
  formData: User;
};

export type SignupEvent =
  | SubmitEvent
  | {
      type: 'FAIL';
      error: string;
    }
  | {
      type: 'SUCCESS';
    }
  | {
      type: 'CLEAR_ERROR';
    }
  | {
      type: 'RETRY_SUBMIT';
    };

export interface SignupContext {
  formData: SignupFields;
  errorMessage: string;
}

export type SignupMachineActor = Interpreter<
  SignupContext,
  SignupStateSchema,
  SignupEvent
>;

export type SignupService = Interpreter<
  SignupContext,
  SignupStateSchema,
  SignupEvent
>;

export const signupMachine = Machine<
  SignupContext,
  SignupStateSchema,
  SignupEvent
>(
  {
    id: 'signup',
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
            actions: 'updateFormData',
            cond: 'formIsValid'
          }
        }
      },
      submitting: {
        invoke: {
          src: 'completeSignup',
          onDone: {
            target: SignupStates.success,
            actions: sendParent((context: SignupContext) => {
              return {
                type: 'SIGNUP_COMPLETE',
                user: context.formData
              };
            })
          },
          onError: {
            target: SignupStates.fail,
            actions: 'updateErrorMessage'
          }
        }
      },
      fail: {
        on: {
          RETRY_SUBMIT: {
            target: SignupStates.submitting,
            actions: 'updateFormData',
            cond: 'formIsValid'
          },
          CLEAR_ERROR: { target: SignupStates.editing }
        },
        after: { 5000: SignupStates.editing }
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
    },
    services: {
      completeSignup: (context) =>
        fetcher({
          url: apiRoutes.completeSignup,
          method: 'POST',
          data: context.formData
        })
    },
    guards: {
      formIsValid: (_, event) => {
        const e = event as SubmitEvent;

        return Object.keys(validateForm(e.formData)).length === 0;
      }
    }
  }
);
