import { Machine } from 'xstate';
import { Project, createEmptyProject } from 'shared/interfaces/Project';

interface MachineContext {
  orgId: string;
  projectId: string;
  project: Project;
  error: string;
}

export const projectMachine = Machine<MachineContext>({
  initial: 'fetching',
  context: {
    orgId: '',
    projectId: '',
    project: createEmptyProject(),
    error: ''
  },
  states: {
    fetching: {
      invoke: {
        src: 'fetchProject',
        onDone: {
          target: 'viewingProject',
          actions: 'setProject'
        },
        onError: {
          target: 'failed',
          actions: 'setError'
        }
      }
    }
  }
});
