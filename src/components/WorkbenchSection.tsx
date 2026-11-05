import React, { useState, useMemo, useRef } from 'react';
import { 
  Star, Clock, ExternalLink, ArrowRight, RotateCcw, 
  Trash2, Compass, ChevronLeft, ChevronRight, Download, Upload, Check, X,
  FileJson, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck,
  FolderArchive, FileText, Layers, Copy
} from 'lucide-react';
import { Project, ResearchCase, ResearchNote, WorkspaceDiffPreview } from '../types';
import { prewarmUrl } from '../utils/prewarm';
import { 
  buildWorkspaceBundle, 
  parseWorkspaceBundle, 
  previewWorkspaceDiff, 
  applyWorkspaceMerge, 
  downloadWorkspaceJsonFile,
  LocalWorkspaceState 
} from '../utils/workspaceBundle';

interface WorkbenchSectionProps {
  pinnedProjects: Project[];
  recentProjects: Project[];
  pinnedProjectIds?: string[];
  recentProjectIds?: string[];
  cases?: ResearchCase[];
  customNotes?: ResearchNote[];
  isCompactMode?: boolean;
  isPinned: (id: string) => boolean;
  onTogglePin: (id: string) => void;
  onMovePinned?: (id: string, direction: 'prev' | 'next') => void;
  onOpenProjectExternal: (project: Project) => void;
  onSelectProject: (project: Project) => void;
  onClearRecent: () => void;
  onResetPinned: () => void;
  onExportConfig?: () => string;
  onImportConfig?: (jsonStr: string) => boolean;
  onApplyWorkspaceBundle?: (newState: LocalWorkspaceState, strategy: 'merge' | 'overwrite') => boolean;
  onNavigateToCatalog: () => void;
}

export const WorkbenchSection: React.FC<WorkbenchSectionProps> = ({
  pinnedProjects,
  recentProjects,
  pinnedProjectIds = [],
  recentProjectIds = [],
  cases = [],
  customNotes = [],
  isCompactMode = false,
  isPinned,
  onTogglePin,
  onMovePinned,
  onOpenProjectExternal,
  onSelectProject,
  onClearRecent,
  onResetPinned,
  onExportConfig,
  onImportConfig,
  onApplyWorkspaceBundle,
  onNavigateToCatalog,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [modalTab, setModalTab] = useState<'export' | 'import'>('export');
  
  // Import state
  const [importJsonText, setImportJsonText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [opStatus, setOpStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current local workspace state for snapshot creation
  const localState: LocalWorkspaceState = useMemo(() => {
    return {
      pinnedProjectIds: pinnedProjectIds.length > 0 ? pinnedProjectIds : pinnedProjects.map((p) => p.id),
      recentProjectIds: recentProjectIds.length > 0 ? recentProjectIds : recentProjects.map((p) => p.id),
      researchCases: cases,
      customNotes,
      compactMode: isCompactMode,
    };
  }, [pinnedProjectIds, pinnedProjects, recentProjectIds, recentProjects, cases, customNotes, isCompactMode]);

  // Current bundle for export
  const exportBundle = useMemo(() => {
    return buildWorkspaceBundle(localState);
  }, [localState]);

  const exportJsonString = useMemo(() => {
    return JSON.stringify(exportBundle, null, 2);
  }, [exportBundle]);

  // Real-time Dry-Run Diff Analysis for import
  const diffAnalysis: WorkspaceDiffPreview | null = useMemo(() => {
    if (!importJsonText.trim()) return null;
    const parseResult = parseWorkspaceBundle(importJsonText);
    if (!parseResult.valid || !parseResult.bundle) {
      return {
        valid: false,
        isLegacyFormat: false,
        error: parseResult.error || '无法解析该快照 JSON',
        summary: {
          schemaVersion: 'unknown',
          exportedAt: '',
          casesCount: 0,
          notesCount: 0,
          pinnedCount: 0,
          artifactsCount: 0,
        },
        diff: {
          newCasesCount: 0,
          updatedCasesCount: 0,
          existingCasesCount: 0,
          newNotesCount: 0,
          pinnedChangesCount: 0,
        },
      };
    }

    return previewWorkspaceDiff(localState, parseResult.bundle, parseResult.isLegacy);
  }, [importJsonText, localState]);

  const handleOpenConfigModal = () => {
    setCopySuccess(false);
    setOpStatus(null);
    setImportJsonText('');
    setModalTab('export');
    setShowConfigModal(true);
  };

  const handleCopyExportJson = () => {
    navigator.clipboard.writeText(exportJsonString);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadFile = () => {
    downloadWorkspaceJsonFile(exportBundle);
    setOpStatus({ type: 'success', message: '已生成并下载 .ef-workspace.json 全量快照文件' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
        setOpStatus(null);
      }
    };
    reader.onerror = () => {
      setOpStatus({ type: 'error', message: '读取本地文件失败，请重试' });
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = (strategy: 'merge' | 'overwrite') => {
    if (!diffAnalysis || !diffAnalysis.valid || !diffAnalysis.bundle) {
      setOpStatus({ type: 'error', message: '当前没有可用的合法快照，请先粘贴或上传有效快照' });
      return;
    }

    const bundle = diffAnalysis.bundle;
    const newState = applyWorkspaceMerge(localState, bundle, strategy);

    if (onApplyWorkspaceBundle) {
      const ok = onApplyWorkspaceBundle(newState, strategy);
      if (ok) {
        setOpStatus({
          type: 'success',
          message: strategy === 'merge' 
            ? '增量合并成功！已安全吸纳新事项、笔记与工具配置。' 
            : '全量覆盖成功！工作台已完整恢复至该快照状态。'
        });
        setTimeout(() => {
          setShowConfigModal(false);
        }, 1200);
      } else {
        setOpStatus({ type: 'error', message: '应用快照失败，请检查浏览器存储权限' });
      }
    } else if (onImportConfig) {
      // Fallback to legacy import handler
      const ok = onImportConfig(JSON.stringify(bundle.data));
      if (ok) {
        setOpStatus({ type: 'success', message: '常用工具配置导入成功！' });
        setTimeout(() => setShowConfigModal(false), 1200);
      } else {
        setOpStatus({ type: 'error', message: '导入失败，请检查格式' });
      }
    }
  };

  return (
    <section id="workbench" className="py-8 border-b border-hub-border font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Sub-header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-hub-border/50 gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-hub-gold" />
            <h2 className="text-lg font-bold text-slate-100 font-sans">
              工作台
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              常用工具与最近打开
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
              本机偏好存储 · 无跨设备同步
            </span>

            <button
              onClick={handleOpenConfigModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border hover:border-hub-gold/40 text-slate-200 hover:text-white text-xs transition-colors shadow-sm"
              title="备份、导出或跨设备合并工作台全量快照"
            >
              <FolderArchive className="w-3.5 h-3.5 text-hub-gold" />
              <span>全量快照与备份 (V4.1)</span>
            </button>

            <button
              onClick={onResetPinned}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border text-slate-400 hover:text-slate-200 text-xs transition-colors"
              title="重置为默认常用推荐"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>恢复默认</span>
            </button>
          </div>
        </div>

        {/* Workbench Layout: Pinned (Left/Top) + Recent Opened (Right/Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Pinned Favorites (2 cols on desktop) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-hub-gold fill-hub-gold/20" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  常用工具
                </h3>
                <span className="text-[11px] font-mono text-hub-gold bg-hub-gold/10 px-1.5 py-0.2 rounded border border-hub-gold/20">
                  {pinnedProjects.length}
                </span>
              </div>
              <button
                onClick={onNavigateToCatalog}
                className="text-xs text-slate-400 hover:text-hub-gold transition-colors flex items-center gap-1"
              >
                <span>浏览全部工具</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pinnedProjects.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-hub-card/40 border border-hub-border border-dashed text-slate-400 text-xs">
                <p className="font-medium text-slate-300 mb-1">当前未固定任何工具</p>
                <p className="text-[11px] text-slate-400 mb-3">你可以在全部工具中点击星标自由添加常用项</p>
                <button
                  onClick={onResetPinned}
                  className="px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-hub-gold border border-hub-gold/30 text-xs transition-colors"
                >
                  恢复默认常用推荐
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {pinnedProjects.map((project, index) => {
                  const isExisting = project.stage === 'existing';
                  return (
                    <div
                      key={project.id}
                      onMouseEnter={() => prewarmUrl(project.officialUrl)}
                      className="group relative flex flex-col justify-between p-3.5 rounded-xl bg-hub-card hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/40 transition-all duration-150 shadow-sm"
                    >
                      {/* Top bar of clean card: domain pill + pin toggle & reordering */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-mono text-slate-400 truncate">
                            {project.domainNumber} {project.domainName}
                          </span>
                          {project.hostingType === 'container' && (
                            <span 
                              className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" 
                              title="云端容器：悬停已预热"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-0.5">
                          {/* Reordering arrows */}
                          {onMovePinned && pinnedProjects.length > 1 && (
                            <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity mr-1">
                              <button
                                disabled={index === 0}
                                onClick={() => onMovePinned(project.id, 'prev')}
                                className="p-0.5 text-slate-500 hover:text-slate-200 disabled:opacity-20 transition-colors"
                                title="向前移动"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button
                                disabled={index === pinnedProjects.length - 1}
                                onClick={() => onMovePinned(project.id, 'next')}
                                className="p-0.5 text-slate-500 hover:text-slate-200 disabled:opacity-20 transition-colors"
                                title="向后移动"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => onTogglePin(project.id)}
                            className="p-1 rounded text-hub-gold hover:text-amber-300 hover:bg-hub-bg/60 transition-colors flex-shrink-0"
                            title="取消常用"
                          >
                            <Star className="w-3 h-3 fill-hub-gold" />
                          </button>
                        </div>
                      </div>

                      {/* Tool name & one-sentence purpose */}
                      <div className="mb-3">
                        <h4 
                          onClick={() => onSelectProject(project)}
                          className="text-sm font-semibold text-slate-100 group-hover:text-hub-goldLight cursor-pointer transition-colors leading-snug mb-1"
                        >
                          {project.name}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {project.summary}
                        </p>
                      </div>

                      {/* Clean direct action: open app or view details */}
                      <div className="pt-2.5 border-t border-hub-border/60 flex items-center justify-between text-xs">
                        <button
                          onClick={() => onSelectProject(project)}
                          className="text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
                        >
                          详情
                        </button>

                        {isExisting && project.officialUrl ? (
                          <button
                            onClick={() => onOpenProjectExternal(project)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-hub-teal/15 hover:bg-hub-teal/25 text-hub-tealLight hover:text-white border border-hub-teal/30 hover:border-hub-teal transition-all text-xs font-medium"
                          >
                            <span>打开应用</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectProject(project)}
                            className="text-xs text-hub-gold hover:underline"
                          >
                            {isExisting ? '查看源码' : '查看方案'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Recent Opened */}
          <div className="lg:border-l lg:border-hub-border lg:pl-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-hub-teal" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    最近打开
                  </h3>
                </div>
                {recentProjects.length > 0 && (
                  <button
                    onClick={onClearRecent}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="清空记录"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {recentProjects.length === 0 ? (
                <div className="p-5 rounded-xl bg-hub-panel/40 border border-hub-border border-dashed text-center">
                  <div className="w-7 h-7 mx-auto mb-2 rounded-full bg-hub-bg flex items-center justify-center text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-medium text-slate-300 mb-0.5">
                    暂无最近打开记录
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    从左侧常用工具或完整目录中打开任意项目，记录将在此呈现。
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      onMouseEnter={() => prewarmUrl(project.officialUrl)}
                      className="p-3 rounded-lg bg-hub-panel/70 hover:bg-hub-panel border border-hub-border hover:border-hub-teal/40 transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[10px] text-hub-teal bg-hub-teal/10 px-1 py-0.2 rounded">
                            {project.domainNumber}
                          </span>
                          <span 
                            onClick={() => onSelectProject(project)}
                            className="text-xs font-medium text-slate-200 group-hover:text-hub-tealLight truncate cursor-pointer"
                          >
                            {project.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {project.summary}
                        </p>
                      </div>

                      {project.officialUrl ? (
                        <button
                          onClick={() => onOpenProjectExternal(project)}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-hub-teal/20 transition-colors flex-shrink-0"
                          title="打开应用"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectProject(project)}
                          className="text-[11px] text-slate-400 hover:text-white"
                        >
                          详情
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Note */}
            <div className="mt-5 pt-3 border-t border-hub-border/50 text-[11px] text-slate-400 font-sans leading-relaxed">
              <p>
                * 记录从本站触发的打开动作，各子系统的实际计算仍由子系统自主维护。
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* V4.1 UNIFIED WORKSPACE SNAPSHOT & SYNC MODAL */}
      {/* ======================================================== */}
      {showConfigModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 text-xs font-sans text-hub-text"
          onClick={() => setShowConfigModal(false)}
        >
          <div 
            className="w-full max-w-2xl bg-hub-panel border border-hub-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-hub-card border-b border-hub-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-hub-gold/15 text-hub-gold flex items-center justify-center border border-hub-gold/30 flex-shrink-0">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">
                      全工作台数据快照管理 (Workspace Bundle V4.1)
                    </h3>
                    <span className="font-mono text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                      完整备份 · 差异合并
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    涵盖研究事项、步骤笔记、证据附件、常用工具与个人偏好，支持跨设备无损迁移。
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-hub-panel transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-tabs: Export vs Import */}
            <div className="flex border-b border-hub-border bg-hub-card/50 px-5 pt-2 flex-shrink-0">
              <button
                onClick={() => setModalTab('export')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition-all ${
                  modalTab === 'export'
                    ? 'border-hub-gold text-hub-goldLight font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出快照备份 (Export)</span>
              </button>
              <button
                onClick={() => setModalTab('import')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition-all ${
                  modalTab === 'import'
                    ? 'border-hub-gold text-hub-goldLight font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>导入恢复与合并 (Import & Merge)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {/* TAB 1: EXPORT */}
              {modalTab === 'export' && (
                <div className="space-y-4">
                  {/* Current Snapshot Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-hub-card border border-hub-border text-center">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">
                        研究事项
                      </span>
                      <span className="text-lg font-bold font-mono text-hub-gold">
                        {exportBundle.summary.casesCount}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        个活跃/归档课题
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-hub-card border border-hub-border text-center">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">
                        证据附件
                      </span>
                      <span className="text-lg font-bold font-mono text-emerald-400">
                        {exportBundle.summary.artifactsCount}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        份实操数据材料
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-hub-card border border-hub-border text-center">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">
                        研报与笔记
                      </span>
                      <span className="text-lg font-bold font-mono text-cyan-400">
                        {exportBundle.summary.notesCount}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        篇沉淀研究底稿
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-hub-card border border-hub-border text-center">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">
                        常用工具
                      </span>
                      <span className="text-lg font-bold font-mono text-slate-200">
                        {exportBundle.summary.pinnedCount}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        项顶置工具排序
                      </span>
                    </div>
                  </div>

                  {/* Primary Export Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={handleDownloadFile}
                      className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-bold transition-all shadow-subtle hover:shadow-gold-glow"
                    >
                      <Download className="w-4 h-4" />
                      <span>下载快照文件 (.ef-workspace.json)</span>
                    </button>

                    <button
                      onClick={handleCopyExportJson}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-hub-card hover:bg-hub-cardHover border border-hub-border text-slate-200 transition-colors"
                    >
                      {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-hub-gold" />}
                      <span>{copySuccess ? '已复制快照 JSON' : '复制快照代码'}</span>
                    </button>
                  </div>

                  {/* Quick Preview Code block */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>快照 JSON 预览 (只读 · Schema v4.1.0)：</span>
                      <span className="font-mono text-[10px]">
                        导出时点：{exportBundle.exportedAt.slice(0, 19).replace('T', ' ')}
                      </span>
                    </div>
                    <textarea
                      readOnly
                      value={exportJsonString}
                      rows={6}
                      className="w-full text-[11px] font-mono bg-hub-card/80 border border-hub-border rounded-xl p-3 text-slate-300 focus:outline-none select-all"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: IMPORT & MERGE */}
              {modalTab === 'import' && (
                <div className="space-y-4">
                  
                  {/* File upload prompt */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-hub-card border border-hub-border">
                    <div className="flex items-center gap-2.5">
                      <FileJson className="w-5 h-5 text-hub-gold" />
                      <div>
                        <div className="font-bold text-slate-200">
                          从文件加载或在此粘贴
                        </div>
                        <div className="text-[11px] text-slate-400">
                          支持现代 .ef-workspace.json 备份或旧版常用工具导出
                        </div>
                      </div>
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json,application/json"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="workspace-file-upload"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-cardHover border border-hub-border text-slate-200 transition-colors text-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-hub-gold" />
                        <span>选择本地快照文件</span>
                      </button>
                    </div>
                  </div>

                  {/* Textarea for JSON */}
                  <div className="space-y-1">
                    <textarea
                      value={importJsonText}
                      onChange={(e) => {
                        setImportJsonText(e.target.value);
                        setOpStatus(null);
                      }}
                      placeholder="在此直接粘贴 .ef-workspace.json 或旧版常用工具 JSON 内容..."
                      rows={6}
                      className="w-full text-[11px] font-mono bg-hub-card border border-hub-border rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60"
                    />
                  </div>

                  {/* Dry-Run Diff Preview Card */}
                  {diffAnalysis && (
                    <div className={`p-4 rounded-xl border ${diffAnalysis.valid ? 'bg-hub-card border-hub-teal/40' : 'bg-rose-950/20 border-rose-800/50'}`}>
                      {!diffAnalysis.valid ? (
                        <div className="flex items-start gap-2.5 text-rose-300">
                          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-xs">快照数据校验未通过</div>
                            <div className="text-[11px] text-rose-300/80 mt-0.5">
                              {diffAnalysis.error}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-hub-border/60 pb-2">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span className="font-bold text-slate-200 text-xs">
                                差异比对分析 (Dry-Run Diff)
                              </span>
                              <span className="text-[10px] font-mono bg-hub-panel px-2 py-0.2 rounded border border-hub-border text-hub-gold">
                                {diffAnalysis.isLegacyFormat ? '兼容旧版配置' : 'V4.1 全量快照'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              导出时点：{diffAnalysis.summary.exportedAt.slice(0, 10) || '未知'}
                            </span>
                          </div>

                          {/* Diff Indicators */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                            <div className="p-2 rounded bg-hub-panel border border-hub-border">
                              <span className="text-slate-400 block text-[10px]">新事项</span>
                              <span className="font-mono font-bold text-emerald-400 text-sm">
                                +{diffAnalysis.diff.newCasesCount}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-hub-panel border border-hub-border">
                              <span className="text-slate-400 block text-[10px]">待更新事项</span>
                              <span className="font-mono font-bold text-amber-300 text-sm">
                                ~{diffAnalysis.diff.updatedCasesCount}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-hub-panel border border-hub-border">
                              <span className="text-slate-400 block text-[10px]">新增研报笔记</span>
                              <span className="font-mono font-bold text-cyan-400 text-sm">
                                +{diffAnalysis.diff.newNotesCount}
                              </span>
                            </div>

                            <div className="p-2 rounded bg-hub-panel border border-hub-border">
                              <span className="text-slate-400 block text-[10px]">常用工具变动</span>
                              <span className="font-mono font-bold text-slate-200 text-sm">
                                {diffAnalysis.diff.pinnedChangesCount}
                              </span>
                            </div>
                          </div>

                          {/* Execution Strategy Buttons */}
                          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                            <button
                              onClick={() => handleExecuteImport('merge')}
                              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>增量合并 (Merge · 推荐)</span>
                            </button>

                            <button
                              onClick={() => handleExecuteImport('overwrite')}
                              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-hub-card hover:bg-hub-panel border border-rose-800/40 hover:border-rose-600 text-rose-300 transition-colors"
                              title="完整覆盖当前本地数据"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>全量覆盖 (Overwrite)</span>
                            </button>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 leading-relaxed italic">
                            * 「增量合并」保留本地已有的事项与研报，仅并入新内容并将同 ID 事项按最新修改时间更新；「全量覆盖」将本地工作台完全替换为快照数据。
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* Status Message */}
              {opStatus && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-mono ${
                  opStatus.type === 'success' 
                    ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                }`}>
                  {opStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                  <span>{opStatus.message}</span>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-hub-card border-t border-hub-border flex items-center justify-between text-slate-400 text-[11px] flex-shrink-0">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>纯前端本地处理 · 数据绝不上传服务器</span>
              </span>

              <button
                onClick={() => setShowConfigModal(false)}
                className="px-3 py-1 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border text-slate-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
