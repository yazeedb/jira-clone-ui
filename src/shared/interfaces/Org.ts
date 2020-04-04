import { Project } from './Project';

export interface Org {
  id: string;
  ownerId: string;
  name: string;
  dateCreated: string;
  projects: Project[];
}
