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
}

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
