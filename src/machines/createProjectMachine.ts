import { Machine, sendParent, Interpreter } from 'xstate';

export type CreateProjectService = Interpreter<any>;
export const createProjectMachine = Machine({
  initial: 'editing',
  on: {
    CLOSE: { actions: sendParent('CLOSE') }
  },
  states: {
    editing: {
      on: { CHECK_NAME_TAKEN: 'checkingNameTaken' }
    },
    checkingNameTaken: {
      invoke: {
        src: 'checkNameTaken',
        onDone: {
          target: 'editing',
          actions: 'setNameAvailability'
        },
        onError: {
          target: 'editing',
          actions: 'setErrorMessage'
        }
      }
    }
  }
});
