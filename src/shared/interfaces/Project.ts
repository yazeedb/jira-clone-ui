import { User, createEmptyUser } from './User';

export interface Project {
  id: string;
  orgName: string;
  key: string;
  type: string;
  lead: User;
  name: string;
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
  data: {
    projects: Project[];
  };
}

export interface ProjectResponse {
  project: Project;
}

export interface Column {
  id: string;
  projectId: string;
  name: string;
  dateCreated: string;
  taskLimit: number;
  uiSequence: number;
  tasks: Task[];
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
