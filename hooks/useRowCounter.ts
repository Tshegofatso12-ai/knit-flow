import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedData, Project } from '../types';

const STORAGE_KEY = '@knit-flow/state';

const DEFAULT_PROJECT: Project = {
  id: 'default',
  name: 'Cozy Oversized Sweater',
  rowCount: 0,
};

const DEFAULT_DATA: PersistedData = {
  currentProject: DEFAULT_PROJECT,
  lastSavedAt: new Date().toISOString(),
};

export function useRowCounter() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<Project>(DEFAULT_PROJECT);
  const [count, setCount] = useState(0);
  const [sessionRowsAdded, setSessionRowsAdded] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data: PersistedData = JSON.parse(raw);
          setCurrentProject(data.currentProject);
          setCount(data.currentProject.rowCount);
        }
      } catch {
        // Fall back to defaults silently
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const debouncedSave = useCallback((updatedProject: Project) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(async () => {
      try {
        const data: PersistedData = {
          currentProject: updatedProject,
          lastSavedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore save errors
      }
    }, 300);
  }, []);

  const saveImmediately = useCallback(async (updatedProject: Project) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    try {
      const data: PersistedData = {
        currentProject: updatedProject,
        lastSavedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore save errors
    }
  }, []);

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      const updated = { ...currentProject, rowCount: next };
      setCurrentProject(updated);
      debouncedSave(updated);
      return next;
    });
    setSessionRowsAdded((prev) => prev + 1);
    setSessionStartedAt((prev) => prev ?? Date.now());
  }, [currentProject, debouncedSave]);

  const decrement = useCallback(() => {
    setCount((prev) => {
      const next = Math.max(0, prev - 1);
      const updated = { ...currentProject, rowCount: next };
      setCurrentProject(updated);
      debouncedSave(updated);
      return next;
    });
  }, [currentProject, debouncedSave]);

  const reset = useCallback(() => {
    const updated = { ...currentProject, rowCount: 0 };
    setCount(0);
    setCurrentProject(updated);
    setSessionRowsAdded(0);
    setSessionStartedAt(null);
    saveImmediately(updated);
  }, [currentProject, saveImmediately]);

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
    currentProject,
    sessionRowsAdded,
    sessionStartedAt,
    isLoading,
    increment,
    decrement,
    reset,
  };
}
