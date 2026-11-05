import { WorkspaceBundleV4, WorkspaceDiffPreview, ResearchCase, ResearchNote } from '../types';

export interface LocalWorkspaceState {
  pinnedProjectIds: string[];
  recentProjectIds: string[];
  researchCases: ResearchCase[];
  customNotes: ResearchNote[];
  themePreference?: 'dark' | 'paper';
  compactMode?: boolean;
}

/**
 * Build a structured, standardized V4.1 Workspace Bundle
 */
export function buildWorkspaceBundle(state: LocalWorkspaceState): WorkspaceBundleV4 {
  const artifactsCount = state.researchCases.reduce((total, c) => {
    return total + c.steps.reduce((stTotal, s) => stTotal + (s.artifacts?.length || 0), 0);
  }, 0);

  return {
    schemaVersion: '4.1.0',
    exportedAt: new Date().toISOString(),
    clientInfo: 'Eugene Finance Research Hub',
    summary: {
      casesCount: state.researchCases.length,
      notesCount: state.customNotes.length,
      pinnedCount: state.pinnedProjectIds.length,
      recentCount: state.recentProjectIds.length,
      artifactsCount,
    },
    data: {
      pinnedProjectIds: [...state.pinnedProjectIds],
      recentProjectIds: [...state.recentProjectIds],
      researchCases: JSON.parse(JSON.stringify(state.researchCases)),
      customNotes: JSON.parse(JSON.stringify(state.customNotes)),
      themePreference: state.themePreference,
      compactMode: state.compactMode,
    },
  };
}

/**
 * Safely parse incoming raw JSON string and convert both modern and legacy formats
 */
export function parseWorkspaceBundle(rawJson: string): {
  valid: boolean;
  bundle?: WorkspaceBundleV4;
  isLegacy?: boolean;
  error?: string;
} {
  try {
    const trimmed = rawJson.trim();
    if (!trimmed) {
      return { valid: false, error: '输入内容为空，请粘贴有效的 JSON 文本或上传文件' };
    }

    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'JSON 格式解析失败：根元素必须为对象' };
    }

    // Modern V4.1 Bundle Format
    if (parsed.schemaVersion === '4.1.0' && parsed.data) {
      const data = parsed.data;
      const researchCases: ResearchCase[] = Array.isArray(data.researchCases) ? data.researchCases : [];
      const customNotes: ResearchNote[] = Array.isArray(data.customNotes) ? data.customNotes : [];
      const pinnedProjectIds: string[] = Array.isArray(data.pinnedProjectIds) ? data.pinnedProjectIds : [];
      const recentProjectIds: string[] = Array.isArray(data.recentProjectIds) ? data.recentProjectIds : [];

      const artifactsCount = researchCases.reduce((total, c) => {
        return total + (c.steps || []).reduce((stTotal, s) => stTotal + (s.artifacts?.length || 0), 0);
      }, 0);

      const bundle: WorkspaceBundleV4 = {
        schemaVersion: '4.1.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        clientInfo: parsed.clientInfo || 'Eugene Finance Bundle',
        summary: {
          casesCount: researchCases.length,
          notesCount: customNotes.length,
          pinnedCount: pinnedProjectIds.length,
          recentCount: recentProjectIds.length,
          artifactsCount,
        },
        data: {
          pinnedProjectIds,
          recentProjectIds,
          researchCases,
          customNotes,
          themePreference: data.themePreference,
          compactMode: data.compactMode,
        },
      };

      return { valid: true, bundle, isLegacy: false };
    }

    // Legacy Format 1: V2/V3 Pinned & Recent JSON ({ pinnedIds: [...], recentIds: [...] })
    if (Array.isArray(parsed.pinnedIds) || Array.isArray(parsed.pinnedProjectIds)) {
      const pinnedProjectIds = Array.isArray(parsed.pinnedProjectIds) 
        ? parsed.pinnedProjectIds 
        : Array.isArray(parsed.pinnedIds) ? parsed.pinnedIds : [];
      const recentProjectIds = Array.isArray(parsed.recentProjectIds) 
        ? parsed.recentProjectIds 
        : Array.isArray(parsed.recentIds) ? parsed.recentIds : [];

      const bundle: WorkspaceBundleV4 = {
        schemaVersion: '4.1.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        clientInfo: 'Legacy V2/V3 Workbench Config',
        summary: {
          casesCount: 0,
          notesCount: 0,
          pinnedCount: pinnedProjectIds.length,
          recentCount: recentProjectIds.length,
          artifactsCount: 0,
        },
        data: {
          pinnedProjectIds,
          recentProjectIds,
          researchCases: [],
          customNotes: [],
        },
      };

      return { valid: true, bundle, isLegacy: true };
    }

    // Legacy Format 2: Cases only JSON ({ cases: [...], customNotes: [...] })
    if (Array.isArray(parsed.cases)) {
      const researchCases: ResearchCase[] = parsed.cases;
      const customNotes: ResearchNote[] = Array.isArray(parsed.customNotes) ? parsed.customNotes : [];
      const artifactsCount = researchCases.reduce((total, c) => {
        return total + (c.steps || []).reduce((stTotal, s) => stTotal + (s.artifacts?.length || 0), 0);
      }, 0);

      const bundle: WorkspaceBundleV4 = {
        schemaVersion: '4.1.0',
        exportedAt: new Date().toISOString(),
        clientInfo: 'Legacy Cases Export',
        summary: {
          casesCount: researchCases.length,
          notesCount: customNotes.length,
          pinnedCount: 0,
          recentCount: 0,
          artifactsCount,
        },
        data: {
          pinnedProjectIds: [],
          recentProjectIds: [],
          researchCases,
          customNotes,
        },
      };

      return { valid: true, bundle, isLegacy: true };
    }

    return { valid: false, error: '未识别的快照数据格式，请确保为 Eugene Finance 导出的 JSON' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { valid: false, error: `JSON 语法解析错误：${msg}` };
  }
}

/**
 * Dry-run comparison between local state and incoming bundle
 */
export function previewWorkspaceDiff(
  localState: LocalWorkspaceState,
  incomingBundle: WorkspaceBundleV4,
  isLegacy = false
): WorkspaceDiffPreview {
  const localCaseMap = new Map(localState.researchCases.map((c) => [c.id, c]));
  let newCasesCount = 0;
  let updatedCasesCount = 0;
  let existingCasesCount = 0;

  for (const incCase of incomingBundle.data.researchCases) {
    const existing = localCaseMap.get(incCase.id);
    if (!existing) {
      newCasesCount++;
    } else {
      // Compare if updated
      const isDifferent = 
        existing.updatedAt !== incCase.updatedAt ||
        existing.steps.filter((s) => s.completed).length !== incCase.steps.filter((s) => s.completed).length ||
        existing.status !== incCase.status;
      if (isDifferent) {
        updatedCasesCount++;
      } else {
        existingCasesCount++;
      }
    }
  }

  const localNoteIds = new Set(localState.customNotes.map((n) => n.id));
  let newNotesCount = 0;
  for (const n of incomingBundle.data.customNotes) {
    if (!localNoteIds.has(n.id)) {
      newNotesCount++;
    }
  }

  const localPinnedSet = new Set(localState.pinnedProjectIds);
  const pinnedChangesCount = incomingBundle.data.pinnedProjectIds.filter((id) => !localPinnedSet.has(id)).length;

  return {
    valid: true,
    isLegacyFormat: isLegacy,
    bundle: incomingBundle,
    summary: {
      schemaVersion: incomingBundle.schemaVersion,
      exportedAt: incomingBundle.exportedAt,
      casesCount: incomingBundle.summary.casesCount,
      notesCount: incomingBundle.summary.notesCount,
      pinnedCount: incomingBundle.summary.pinnedCount,
      artifactsCount: incomingBundle.summary.artifactsCount,
    },
    diff: {
      newCasesCount,
      updatedCasesCount,
      existingCasesCount,
      newNotesCount,
      pinnedChangesCount,
    },
  };
}

/**
 * Apply merge or overwrite strategy
 */
export function applyWorkspaceMerge(
  localState: LocalWorkspaceState,
  incomingBundle: WorkspaceBundleV4,
  strategy: 'merge' | 'overwrite'
): LocalWorkspaceState {
  if (strategy === 'overwrite') {
    return {
      pinnedProjectIds: incomingBundle.data.pinnedProjectIds.length > 0 
        ? [...incomingBundle.data.pinnedProjectIds] 
        : [...localState.pinnedProjectIds],
      recentProjectIds: incomingBundle.data.recentProjectIds.length > 0 
        ? [...incomingBundle.data.recentProjectIds] 
        : [...localState.recentProjectIds],
      researchCases: incomingBundle.data.researchCases.length > 0 
        ? JSON.parse(JSON.stringify(incomingBundle.data.researchCases)) 
        : [...localState.researchCases],
      customNotes: incomingBundle.data.customNotes.length > 0 
        ? JSON.parse(JSON.stringify(incomingBundle.data.customNotes)) 
        : [...localState.customNotes],
      themePreference: incomingBundle.data.themePreference || localState.themePreference,
      compactMode: incomingBundle.data.compactMode ?? localState.compactMode,
    };
  }

  // Strategy: 'merge' (Incremental non-destructive merge)
  const caseMap = new Map<string, ResearchCase>();
  // 1. Put local cases first
  for (const c of localState.researchCases) {
    caseMap.set(c.id, c);
  }
  // 2. Merge incoming cases
  for (const inc of incomingBundle.data.researchCases) {
    const existing = caseMap.get(inc.id);
    if (!existing) {
      caseMap.set(inc.id, inc);
    } else {
      // If incoming is updated more recently or has more steps completed, take incoming
      if (inc.updatedAt >= existing.updatedAt) {
        caseMap.set(inc.id, inc);
      }
    }
  }

  // 3. Notes merge by ID
  const noteMap = new Map<string, ResearchNote>();
  for (const n of localState.customNotes) {
    noteMap.set(n.id, n);
  }
  for (const n of incomingBundle.data.customNotes) {
    noteMap.set(n.id, n);
  }

  // 4. Pinned projects merge (maintain order of incoming then append local)
  const mergedPinned = Array.from(new Set([
    ...incomingBundle.data.pinnedProjectIds,
    ...localState.pinnedProjectIds,
  ]));

  // 5. Recent projects merge
  const mergedRecent = Array.from(new Set([
    ...incomingBundle.data.recentProjectIds,
    ...localState.recentProjectIds,
  ])).slice(0, 5);

  return {
    pinnedProjectIds: mergedPinned.length > 0 ? mergedPinned : localState.pinnedProjectIds,
    recentProjectIds: mergedRecent,
    researchCases: Array.from(caseMap.values()),
    customNotes: Array.from(noteMap.values()),
    themePreference: incomingBundle.data.themePreference || localState.themePreference,
    compactMode: incomingBundle.data.compactMode ?? localState.compactMode,
  };
}

/**
 * Browser download helper for .ef-workspace.json file
 */
export function downloadWorkspaceJsonFile(bundle: WorkspaceBundleV4): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `ef-workspace-${dateStr}.json`;
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
