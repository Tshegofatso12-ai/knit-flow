export interface Project {
  id: string;
  name: string;
  rowCount: number;
}

export interface PersistedData {
  currentProject: Project;
  lastSavedAt: string;
}
