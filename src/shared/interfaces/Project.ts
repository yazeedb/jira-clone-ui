import { User, createEmptyUser } from './User';
import { OrgName } from './Org';

type ProjectKey = string;

export interface Project {
  id: string;
  name: string;
  orgName: OrgName;
  key: ProjectKey;
  type: string;
  lead: User;
  icon: string;
  dateCreated: string;
  columns: Column[];
}

export const createEmptyProject = (): Project => {
  return {
    id: '',
    orgName: '',
    key: '',
    type: '',
    lead: createEmptyUser(),
    name: '',
    icon: '',
    dateCreated: '',
    columns: []
  };
};

export interface ProjectsResponse {
  projects: Project[];
}

export interface ProjectResponse {
  project: Project;
}

export interface Column {
  id: string;
  projectId: string;
  name: string;
  dateCreated: string;
  taskLimit: number | null;
  uiSequence: number;
  tasks: Task[];
}

export interface ColumnsResponse {
  columns: Column[];
}

export interface Task {
  id: string;
  orgName: string;
  projectId: string;
  assigneeId: string;
  columnId: string;
  reporterId: string;
  uiSequence: number;
  name: string;
  dateCreated: string;
  dateUpdated: string;
  description: string;
  pendingDelete?: boolean;
  pendingCreation?: boolean;
}

export const createPendingTask = (id: string, name: string): Task => {
  return {
    id,
    name,
    pendingCreation: true,
    // This'll force the task to render last
    uiSequence: Infinity,

    // Useless properties for pending task
    // TODO: Code smell? Task interface is starting to feel brittle.
    // How do we fix it?
    orgName: '',
    projectId: '',
    assigneeId: '',
    columnId: '',
    reporterId: '',
    dateCreated: '',
    dateUpdated: '',
    description: '',
    pendingDelete: false
  };
};

export interface ProjectAvailableResponse {
  available: boolean;
}

export interface FindOneProjectParams {
  orgName: OrgName;
  projectKey: ProjectKey;
}

export interface FindOneColumnParams extends FindOneProjectParams {
  columnId: string;
}

export interface FindOneTaskParams extends FindOneColumnParams {
  taskId: string;
}
