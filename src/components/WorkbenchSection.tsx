import React, { useState } from 'react';
import { 
  Star, Clock, ExternalLink, ArrowRight, RotateCcw, 
  Trash2, Compass, ChevronLeft, ChevronRight, Download, Upload, Check, X 
} from 'lucide-react';
import { Project } from '../types';
import { prewarmUrl } from '../utils/prewarm';

interface WorkbenchSectionProps {
  pinnedProjects: Project[];
  recentProjects: Project[];
  isPinned: (id: string) => boolean;
  onTogglePin: (id: string) => void;
  onMovePinned?: (id: string, direction: 'prev' | 'next') => void;
  onOpenProjectExternal: (project: Project) => void;
  onSelectProject: (project: Project) => void;
  onClearRecent: () => void;
  onResetPinned: () => void;
  onExportConfig?: () => string;
  onImportConfig?: (jsonStr: string) => boolean;
  onNavigateToCatalog: () => void;
}

export const WorkbenchSection: React.FC<WorkbenchSectionProps> = ({
  pinnedProjects,
  recentProjects,
  isPinned,
  onTogglePin,
  onMovePinned,
  onOpenProjectExternal,
  onSelectProject,
  onClearRecent,
  onResetPinned,
  onExportConfig,
  onImportConfig,
  onNavigateToCatalog,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configJson, setConfigJson] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleOpenConfigModal = () => {
    if (onExportConfig) {
      setConfigJson(onExportConfig());
    }
    setCopySuccess(false);
    setImportStatus(null);
    setShowConfigModal(true);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(configJson);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleApplyImport = () => {
    if (!onImportConfig) return;
    const success = onImportConfig(configJson);
    if (success) {
      setImportStatus('导入成功！常用配置已更新。');
      setTimeout(() => setShowConfigModal(false), 1200);
    } else {
      setImportStatus('导入失败，请检查 JSON 格式是否正确。');
    }
  };

  return (
    <section id="workbench" className="py-8 border-b border-hub-border">
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

            {onExportConfig && (
              <button
                onClick={handleOpenConfigModal}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-hub-panel hover:bg-hub-card border border-hub-border text-slate-300 hover:text-white text-xs transition-colors"
                title="备份或迁移工作台配置"
              >
                <Download className="w-3 h-3 text-hub-gold" />
                <span>备份/迁移</span>
              </button>
            )}

            <button
              onClick={onResetPinned}
              className="flex items-center gap-1 px-2 py-1 rounded bg-hub-panel hover:bg-hub-card border border-hub-border text-slate-400 hover:text-slate-200 text-xs transition-colors"
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
                /* Honest Empty State */
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

      {/* Config Export / Import Modal */}
      {showConfigModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowConfigModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-hub-panel border border-hub-border rounded-xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-hub-border pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-hub-gold" />
                <span>工作台配置备份与跨设备迁移</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              复制以下 JSON 配置可在另一台电脑上粘贴恢复，或保存为个人工作台备份：
            </p>

            <textarea
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              rows={8}
              className="w-full text-xs font-mono bg-hub-card border border-hub-border rounded-lg p-3 text-slate-200 focus:outline-none focus:border-hub-gold"
            />

            {importStatus && (
              <p className={`text-xs font-mono ${importStatus.includes('成功') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {importStatus}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-hub-border text-xs">
              <button
                onClick={handleCopyConfig}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-card hover:bg-hub-cardHover border border-hub-border text-slate-200 transition-colors"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>已复制配置</span>
                  </>
                ) : (
                  <span>复制配置 JSON</span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyImport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-semibold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>应用此配置</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
