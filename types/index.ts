export interface Project {
  id: string;
  name: string;
  rowCount: number;
  createdAt: string;
}

export interface PersistedData {
  projects: Project[];
  activeProjectId: string;
}
