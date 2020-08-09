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
import { notificationService } from './notificationMachine';

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
  success = 'success'
}

export interface SignupStateSchema {
  states: {
    [SignupStates.editing]: {};
    [SignupStates.submitting]: {};
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
}

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
      formData: {}
    },
    on: {
      SUBMIT: {
        target: SignupStates.submitting,
        actions: 'updateFormData',
        cond: 'formIsValid'
      }
    },
    states: {
      editing: {},
      submitting: {
        invoke: {
          src: 'completeSignup',
          onDone: {
            target: SignupStates.success,
            actions: 'notifyParentSuccess'
          },
          onError: {
            target: SignupStates.editing,
            actions: 'flashError'
          }
        },
        on: { SUBMIT: undefined }
      },
      success: { type: 'final' }
    }
  },
  {
    actions: {
      notifyParentSuccess: sendParent((context: SignupContext, event: any) => {
        return {
          type: 'SIGNUP_COMPLETE',
          user: context.formData
        };
      }),
      updateFormData: assign({
        formData: (_, event) => {
          const e = event as SubmitEvent;

          return e.formData;
        }
      }),
      flashError: assign((context, event) => {
        const e = event as DoneInvokeEvent<Error>;

        notificationService.send({
          type: 'OPEN',
          message: e.data.message,
          notificationType: 'error'
        });

        return context;
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
