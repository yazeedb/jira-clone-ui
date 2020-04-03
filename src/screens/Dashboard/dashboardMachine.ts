import { Machine, assign } from 'xstate';
import { User } from 'authMachine';
import { fetcher } from 'fetcher';
import { apiRoutes } from 'shared/apiRoutes';

interface Project {
  name: string;
  key: string;
  type: string;
  lead: User;
}

export enum DashboardStates {
  fetching = 'fetching',
  error = 'error',
  success = 'success',
  beginCreateProject = 'beginCreateProject',
  updateProjectFilter = 'updateProjectFilter'
}

interface Dashboardchema {
  states: {
    [DashboardStates.fetching]: {};
    [DashboardStates.error]: {};
    [DashboardStates.success]: {};
  };
}

type DashboardEvent =
  | { type: 'FETCH_PROJECTS' }
  | { type: 'RETRY' }
  | { type: 'CREATE_PROJECT' }
  | { type: 'UPDATE_PROJECT_FILTER'; value: string };

interface DashboardContext {
  projects?: Project[];
  error?: string;
  projectFilter?: string;
}

export const dashboardMachine = Machine<
  DashboardContext,
  Dashboardchema,
  DashboardEvent
>({
  context: {
    projects: undefined,
    error: undefined,
    projectFilter: undefined
  },
  initial: DashboardStates.fetching,
  states: {
    fetching: {
      invoke: {
        src: () => fetcher(apiRoutes.projects),
        onDone: {
          target: DashboardStates.success,
          actions: assign({
            projects: (_, event) => event.data
          })
        },
        onError: { target: DashboardStates.error }
      }
    },
    success: {
      on: {
        CREATE_PROJECT: {
          target: DashboardStates.beginCreateProject
          // TODO: Child createProjectMachine???
        }
      }
    },
    error: {
      on: {
        RETRY: DashboardStates.fetching,
        UPDATE_PROJECT_FILTER: {
          target: DashboardStates.updateProjectFilter,
          actions: assign({
            projectFilter: (_, event) => event.value
          })
        }
      }
    }
  }
});
