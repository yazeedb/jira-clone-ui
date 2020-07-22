import {
  Machine,
  assign,
  DoneInvokeEvent,
  sendParent,
  Interpreter
} from 'xstate';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';
import { notificationService } from './notificationMachine';

export enum CreateOrgStates {
  editing = 'editing',
  submitting = 'submitting',
  success = 'success'
}

type FormFields = { org: string };

interface MachineContext {
  formData: FormFields;
}

type MachineEvent = SubmitEvent | RetryEvent;

export type CreateOrgService = Interpreter<MachineContext, any, MachineEvent>;

export const createOrgMachine = Machine<MachineContext, any, MachineEvent>(
  {
    initial: CreateOrgStates.editing,
    context: {
      formData: { org: '' }
    },
    on: {
      SUBMIT: {
        target: 'submitting',
        actions: 'updateFormData',
        cond: 'formIsValid'
      }
    },
    states: {
      editing: {},
      submitting: {
        invoke: {
          src: 'createOrg',
          onDone: {
            target: CreateOrgStates.success,
            actions: sendParent('ORG_CREATED')
          },
          onError: {
            target: CreateOrgStates.editing,
            actions: 'flashError'
          }
        },
        on: { SUBMIT: undefined }
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
      flashError: assign((context, event) => {
        const e = event as DoneInvokeEvent<Error>;

        notificationService.send({
          type: 'OPEN',
          message: e.data.message,
          notificationType: 'error'
        });

        return context;
      }),
      updateFormData: assign({
        formData: (_, event) => {
          const e = event as SubmitEvent;

          return e.formData;
        }
      })
    },
    guards: {
      formIsValid: (context, event) => {
        const e = event as SubmitEvent;

        return e.formData.org.trim().length > 0;
      }
    }
  }
);

type SubmitEvent = { type: 'SUBMIT'; formData: FormFields };
type RetryEvent = { type: 'RETRY' };
