export interface Project {
  id: string;
  orgId: string;
  key: string;
  name: string;
  icon: string;
  dateCreated: string;
  columns: Column[];
}

export interface ProjectsResponse {
  data: {
    projects: Project[];
  };
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
  orgId: string;
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

export interface ProjectNameAvailableResponse {
  available: boolean;
}
