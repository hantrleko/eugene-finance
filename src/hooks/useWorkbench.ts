import { useState, useEffect } from 'react';
import { PROJECTS } from '../data/projects';
import { Project } from '../types';

const PINNED_STORAGE_KEY = 'ef_workbench_pinned_v2';
const RECENT_STORAGE_KEY = 'ef_workbench_recent_v2';

// Initial 6 recommended entries
export const DEFAULT_PINNED_IDS = [
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
      // Key fix: If saved is present in localStorage (even as "[]"), respect user's explicit choice!
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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
      if (saved !== null) {
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

  // Toggle pin: support clean toggle without unexpectedly dropping items
  const togglePin = (projectId: string) => {
    setPinnedIds((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId);
      } else {
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

  const clearAllPinned = () => {
    setPinnedIds([]);
  };

  const resetPinnedToDefault = () => {
    setPinnedIds(DEFAULT_PINNED_IDS);
  };

  // Reorder pinned projects
  const movePinned = (projectId: string, direction: 'prev' | 'next') => {
    setPinnedIds((prev) => {
      const index = prev.indexOf(projectId);
      if (index === -1) return prev;
      const targetIndex = direction === 'prev' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Export workbench configuration as JSON
  const exportConfig = () => {
    const config = {
      version: 1,
      exportedAt: new Date().toISOString(),
      pinnedIds,
      recentIds,
    };
    return JSON.stringify(config, null, 2);
  };

  // Import workbench configuration from JSON
  const importConfig = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.pinnedIds)) {
        const validIds = parsed.pinnedIds.filter((id: string) => 
          PROJECTS.some((p) => p.id === id)
        );
        setPinnedIds(validIds);
        if (Array.isArray(parsed.recentIds)) {
          setRecentIds(parsed.recentIds);
        }
        return true;
      }
    } catch {
      // parse error
    }
    return false;
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
    movePinned,
    exportConfig,
    importConfig,
    recordOpen,
    clearRecent,
    clearAllPinned,
    resetPinnedToDefault,
    pinnedCount: pinnedProjects.length
  };
}
