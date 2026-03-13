import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedData, Project } from '../types';

const STORAGE_KEY = '@knit-flow/state';

const DEFAULT_PROJECT: Project = {
  id: 'default',
  name: 'Cozy Oversized Sweater',
  rowCount: 0,
  createdAt: new Date().toISOString(),
};

export function useRowCounter() {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([DEFAULT_PROJECT]);
  const [activeProjectId, setActiveProjectId] = useState<string>(DEFAULT_PROJECT.id);
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
          // Migrate from old single-project format
          if (parsed.currentProject && !parsed.projects) {
            const migrated: Project = {
              ...parsed.currentProject,
              createdAt: parsed.lastSavedAt ?? new Date().toISOString(),
            };
            setProjects([migrated]);
            setActiveProjectId(migrated.id);
          } else {
            const data: PersistedData = parsed;
            setProjects(data.projects);
            setActiveProjectId(data.activeProjectId);
          }
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
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(async () => {
      try {
        const data: PersistedData = { projects: updatedProjects, activeProjectId: currentActiveId };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore save errors
      }
    }, 300);
  }, []);

  const saveImmediately = useCallback(async (updatedProjects: Project[], currentActiveId: string) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    try {
      const data: PersistedData = { projects: updatedProjects, activeProjectId: currentActiveId };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore save errors
    }
  }, []);

  const increment = useCallback(() => {
    setProjects((prev) => {
      const updated = prev.map((p) =>
        p.id === activeProjectId ? { ...p, rowCount: p.rowCount + 1 } : p
      );
      debouncedSave(updated, activeProjectId);
      return updated;
    });
    setSessionRowsAdded((prev) => prev + 1);
    setSessionStartedAt((prev) => prev ?? Date.now());
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
        p.id === activeProjectId ? { ...p, rowCount: 0 } : p
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
      setActiveProjectId(id);
      setSessionRowsAdded(0);
      setSessionStartedAt(null);
      setProjects((prev) => {
        saveImmediately(prev, id);
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
        if (prev.length <= 1) return prev; // never delete the last project
        const updated = prev.filter((p) => p.id !== id);
        const newActiveId = id === activeProjectId ? updated[0].id : activeProjectId;
        if (id === activeProjectId) {
          setActiveProjectId(newActiveId);
          setSessionRowsAdded(0);
          setSessionStartedAt(null);
        }
        saveImmediately(updated, newActiveId);
        return updated;
      });
    },
    [activeProjectId, saveImmediately]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
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
