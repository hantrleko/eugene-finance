import { useState, useEffect } from 'react';
import { PROJECTS } from '../data/projects';
import { Project } from '../types';

const PINNED_STORAGE_KEY = 'ef_workbench_pinned_v1';
const RECENT_STORAGE_KEY = 'ef_workbench_recent_v1';

// Initial 6 recommended entries
const DEFAULT_PINNED_IDS = [
  'market-pulse',
  'quant-risk-lab',
  'market-microstructure-lab',
  'listed-filing-textmine',
  'factor-workbench',
  'ef-lab'
];

export function useWorkbench() {
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(PINNED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_PINNED_IDS;
  });

  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Save pinned
  useEffect(() => {
    try {
      localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedIds));
    } catch {
      // storage unavailable
    }
  }, [pinnedIds]);

  // Save recent
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentIds));
    } catch {
      // storage unavailable
    }
  }, [recentIds]);

  // Toggle pin
  const togglePin = (projectId: string) => {
    setPinnedIds((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId);
      } else {
        // limit to 6
        if (prev.length >= 6) {
          return [...prev.slice(1), projectId];
        }
        return [...prev, projectId];
      }
    });
  };

  const isPinned = (projectId: string) => pinnedIds.includes(projectId);

  // Record an actual open
  const recordOpen = (projectId: string) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== projectId);
      return [projectId, ...filtered].slice(0, 3);
    });
  };

  const clearRecent = () => {
    setRecentIds([]);
  };

  const resetPinnedToDefault = () => {
    setPinnedIds(DEFAULT_PINNED_IDS);
  };

  // Resolve project objects
  const pinnedProjects: Project[] = pinnedIds
    .map((id) => PROJECTS.find((p) => p.id === id))
    .filter((p): p is Project => Boolean(p));

  const recentProjects: Project[] = recentIds
    .map((id) => PROJECTS.find((p) => p.id === id))
    .filter((p): p is Project => Boolean(p));

  return {
    pinnedProjects,
    recentProjects,
    isPinned,
    togglePin,
    recordOpen,
    clearRecent,
    resetPinnedToDefault,
    pinnedCount: pinnedProjects.length
  };
}
