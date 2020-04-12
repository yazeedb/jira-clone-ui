import { Machine, assign, sendParent, Interpreter } from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { User } from 'shared/interfaces/User';
import { createSignupCompleteEvent } from 'authMachine';
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
  needOrgInfo = 'needOrgInfo',
  success = 'success'
}

interface SignupStateSchema {
  states: {
    [SignupStates.editing]: {};
    [SignupStates.submitting]: {};
    [SignupStates.fail]: {};
    [SignupStates.needOrgInfo]: {};
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
    }
  | {
      type: 'CLEAR_ERROR';
    };

interface SignupContext {
  formData: SignupFields;
  errorMessage: string;
}

export type SignupMachineActor = Interpreter<
  SignupContext,
  SignupStateSchema,
  SignupEvent
>;

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
        onDone: [
          {
            target: SignupStates.success,
            cond: (_, event) => event.data.data.hasOrg === true,
            actions: sendParent((context: SignupContext) => {
              // Safe to assume
              const formData = context.formData as User;

              return createSignupCompleteEvent(context.formData as User);
            })
          },
          {
            target: SignupStates.needOrgInfo,
            cond: (_, event) => event.data.data.hasOrg === false
          }
        ],
        onError: {
          target: SignupStates.fail,
          actions: assign({
            errorMessage: (_, event) => event.data.message
          })
        }
      }
    },
    fail: {
      after: { 5000: SignupStates.editing },
      on: { CLEAR_ERROR: SignupStates.editing }
    },
    needOrgInfo: {},
    success: {}
  }
});
