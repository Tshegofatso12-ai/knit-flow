import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedData, Project } from '../types';

const STORAGE_KEY = '@knit-flow/state';

const DEFAULT_PROJECT: Project = {
  id: 'default',
  name: 'Cozy Oversized Sweater',
  rowCount: 0,
  createdAt: new Date().toISOString(),
  sessionStartedAt: null,
  sessionRowsAdded: 0,
};

/** Ensure projects loaded from storage always have session fields (migration). */
function normalise(p: Project): Project {
  return {
    ...p,
    sessionStartedAt: p.sessionStartedAt ?? null,
    sessionRowsAdded: p.sessionRowsAdded ?? 0,
  };
}

export function useRowCounter() {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([DEFAULT_PROJECT]);
  const [activeProjectId, setActiveProjectId] = useState<string>(DEFAULT_PROJECT.id);

  // Local mirrors of the active project's session — kept in sync so the timer
  // and pace calculation always read the latest value without waiting for a
  // re-render from the projects array update.
  const [sessionRowsAdded, setSessionRowsAdded] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0];
  const count = activeProject?.rowCount ?? 0;

  // Load persisted state on mount
  useEffect(() => {
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          let loadedProjects: Project[];
          let loadedActiveId: string;

          // Migrate from old single-project format
          if (parsed.currentProject && !parsed.projects) {
            const migrated = normalise({
              ...parsed.currentProject,
              createdAt: parsed.lastSavedAt ?? new Date().toISOString(),
            });
            loadedProjects = [migrated];
            loadedActiveId = migrated.id;
          } else {
            const data: PersistedData = parsed;
            loadedProjects = data.projects.map(normalise);
            loadedActiveId = data.activeProjectId;
          }

          setProjects(loadedProjects);
          setActiveProjectId(loadedActiveId);

          // Restore session for the active project
          const active = loadedProjects.find((p) => p.id === loadedActiveId) ?? loadedProjects[0];
          setSessionStartedAt(active.sessionStartedAt);
          setSessionRowsAdded(active.sessionRowsAdded);
        }
      } catch {
        // Fall back to defaults silently
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const debouncedSave = useCallback((updatedProjects: Project[], currentActiveId: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ projects: updatedProjects, activeProjectId: currentActiveId } satisfies PersistedData)
        );
      } catch { /* ignore */ }
    }, 300);
  }, []);

  const saveImmediately = useCallback(async (updatedProjects: Project[], currentActiveId: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ projects: updatedProjects, activeProjectId: currentActiveId } satisfies PersistedData)
      );
    } catch { /* ignore */ }
  }, []);

  const increment = useCallback(() => {
    const now = Date.now();
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        const startedAt = p.sessionStartedAt ?? now;
        return {
          ...p,
          rowCount: p.rowCount + 1,
          sessionStartedAt: startedAt,
          sessionRowsAdded: p.sessionRowsAdded + 1,
        };
      });
      debouncedSave(updated, activeProjectId);
      return updated;
    });
    setSessionRowsAdded((prev) => prev + 1);
    setSessionStartedAt((prev) => prev ?? now);
  }, [activeProjectId, debouncedSave]);

  const decrement = useCallback(() => {
    setProjects((prev) => {
      const updated = prev.map((p) =>
        p.id === activeProjectId ? { ...p, rowCount: Math.max(0, p.rowCount - 1) } : p
      );
      debouncedSave(updated, activeProjectId);
      return updated;
    });
  }, [activeProjectId, debouncedSave]);

  const reset = useCallback(() => {
    setProjects((prev) => {
      const updated = prev.map((p) =>
        p.id === activeProjectId
          ? { ...p, rowCount: 0, sessionStartedAt: null, sessionRowsAdded: 0 }
          : p
      );
      saveImmediately(updated, activeProjectId);
      return updated;
    });
    setSessionRowsAdded(0);
    setSessionStartedAt(null);
  }, [activeProjectId, saveImmediately]);

  const createProject = useCallback(
    (name: string) => {
      const newProject: Project = {
        id: Date.now().toString(),
        name: name.trim(),
        rowCount: 0,
        createdAt: new Date().toISOString(),
        sessionStartedAt: null,
        sessionRowsAdded: 0,
      };
      setProjects((prev) => {
        const updated = [...prev, newProject];
        saveImmediately(updated, newProject.id);
        return updated;
      });
      setActiveProjectId(newProject.id);
      setSessionRowsAdded(0);
      setSessionStartedAt(null);
    },
    [saveImmediately]
  );

  const switchProject = useCallback(
    (id: string) => {
      setProjects((prev) => {
        const target = prev.find((p) => p.id === id) ?? prev[0];
        setActiveProjectId(target.id);
        setSessionRowsAdded(target.sessionRowsAdded);
        setSessionStartedAt(target.sessionStartedAt);
        saveImmediately(prev, target.id);
        return prev;
      });
    },
    [saveImmediately]
  );

  const renameProject = useCallback(
    (id: string, name: string) => {
      setProjects((prev) => {
        const updated = prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p));
        saveImmediately(updated, activeProjectId);
        return updated;
      });
    },
    [activeProjectId, saveImmediately]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => {
        if (prev.length <= 1) return prev;
        const updated = prev.filter((p) => p.id !== id);
        const newActiveId = id === activeProjectId ? updated[0].id : activeProjectId;
        if (id === activeProjectId) {
          const newActive = updated.find((p) => p.id === newActiveId) ?? updated[0];
          setActiveProjectId(newActive.id);
          setSessionRowsAdded(newActive.sessionRowsAdded);
          setSessionStartedAt(newActive.sessionStartedAt);
        }
        saveImmediately(updated, newActiveId);
        return updated;
      });
    },
    [activeProjectId, saveImmediately]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return {
    count,
    activeProject,
    projects,
    activeProjectId,
    sessionRowsAdded,
    sessionStartedAt,
    isLoading,
    increment,
    decrement,
    reset,
    createProject,
    switchProject,
    renameProject,
    deleteProject,
  };
}
