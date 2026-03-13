export interface Project {
  id: string;
  name: string;
  rowCount: number;
  createdAt: string;
  sessionStartedAt: number | null;
  sessionRowsAdded: number;
}

export interface PersistedData {
  projects: Project[];
  activeProjectId: string;
}
