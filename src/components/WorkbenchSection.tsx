import React from 'react';
import { Star, Clock, ExternalLink, ArrowRight, RotateCcw, Trash2, Info, Compass } from 'lucide-react';
import { Project } from '../types';

interface WorkbenchSectionProps {
  pinnedProjects: Project[];
  recentProjects: Project[];
  isPinned: (id: string) => boolean;
  onTogglePin: (id: string) => void;
  onOpenProjectExternal: (project: Project) => void;
  onSelectProject: (project: Project) => void;
  onClearRecent: () => void;
  onResetPinned: () => void;
}

export const WorkbenchSection: React.FC<WorkbenchSectionProps> = ({
  pinnedProjects,
  recentProjects,
  isPinned,
  onTogglePin,
  onOpenProjectExternal,
  onSelectProject,
  onClearRecent,
  onResetPinned,
}) => {
  return (
    <section id="workbench" className="py-10 border-b border-hub-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-hub-border/50 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-hub-gold uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>MY WORKBENCH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-3">
              <span>我的工作台</span>
              <span className="text-xs font-normal text-slate-400 font-mono hidden sm:inline">
                常用入口与最近打开
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-mono text-[11px] hidden lg:inline">
              本机偏好存储 · 无跨设备同步
            </span>
            <button
              onClick={onResetPinned}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-hub-panel hover:bg-hub-card border border-hub-border text-slate-400 hover:text-slate-200 text-xs transition-colors"
              title="重置为默认6个常用推荐"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>恢复默认常用</span>
            </button>
          </div>
        </div>

        {/* Workbench Layout: Pinned (Left/Top) + Recent Opened (Right/Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Pinned Favorites (2 cols on desktop) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-hub-gold fill-hub-gold/20" />
                <h3 className="text-sm font-semibold text-slate-200">
                  常用入口固定位
                </h3>
                <span className="text-xs font-mono text-hub-gold bg-hub-gold/10 px-2 py-0.5 rounded border border-hub-gold/20">
                  {pinnedProjects.length}/6
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                点击卡片右上角星标自定义
              </span>
            </div>

            {pinnedProjects.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-hub-card/40 border border-hub-border text-slate-400 text-xs">
                <p>当前未固定任何项目</p>
                <button
                  onClick={onResetPinned}
                  className="mt-2 text-hub-gold hover:underline"
                >
                  点击恢复默认常用配置
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {pinnedProjects.map((project) => {
                  const isExisting = project.stage === 'existing';
                  return (
                    <div
                      key={project.id}
                      className="group relative flex flex-col justify-between p-4 rounded-xl bg-hub-card/80 hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/40 transition-all duration-200 shadow-sm hover:shadow-gold-glow"
                    >
                      {/* Top bar of pinned card */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono text-hub-gold/90 bg-hub-gold/10 px-1.5 py-0.5 rounded border border-hub-gold/20">
                          {project.domainNumber} {project.domainName}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(project.id);
                          }}
                          className="p-1 rounded text-hub-gold hover:text-amber-300 hover:bg-hub-bg/60 transition-colors"
                          title="取消固定"
                        >
                          <Star className="w-3.5 h-3.5 fill-hub-gold" />
                        </button>
                      </div>

                      {/* Title & Info */}
                      <div className="mb-3">
                        <h4 
                          onClick={() => onSelectProject(project)}
                          className="text-sm font-semibold text-slate-100 group-hover:text-hub-goldLight cursor-pointer transition-colors"
                        >
                          {project.name}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400 line-clamp-1 mb-1">
                          {project.enName}
                        </p>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {project.summary}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-hub-border/60 flex items-center justify-between text-xs">
                        <button
                          onClick={() => onSelectProject(project)}
                          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors text-[11px]"
                        >
                          <Info className="w-3 h-3 text-slate-400" />
                          <span>说明</span>
                        </button>

                        {isExisting && (project.officialUrl || project.repoUrl) ? (
                          <button
                            onClick={() => onOpenProjectExternal(project)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-hub-panel hover:bg-hub-teal/20 text-hub-tealLight hover:text-white border border-hub-teal/30 hover:border-hub-teal transition-all text-xs font-medium"
                          >
                            <span>打开</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectProject(project)}
                            className="text-xs text-hub-gold hover:underline"
                          >
                            查看方案
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Recent Opened (1 col on desktop) */}
          <div className="lg:border-l lg:border-hub-border lg:pl-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-hub-teal" />
                  <h3 className="text-sm font-semibold text-slate-200">
                    最近打开
                  </h3>
                </div>
                {recentProjects.length > 0 && (
                  <button
                    onClick={onClearRecent}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="清空最近记录"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {recentProjects.length === 0 ? (
                /* Honest Empty State */
                <div className="p-6 rounded-xl bg-hub-panel/50 border border-hub-border border-dashed text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-hub-bg flex items-center justify-center text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-slate-300 mb-1">
                    暂无最近打开记录
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    从左侧常用入口或下方全部模块中打开任意项目，访问足迹将自动在此留存。
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-3 rounded-lg bg-hub-panel/80 hover:bg-hub-panel border border-hub-border hover:border-hub-teal/40 transition-all flex items-center justify-between group"
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

                      <button
                        onClick={() => onOpenProjectExternal(project)}
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-hub-teal/20 transition-colors flex-shrink-0"
                        title="打开项目"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-note on audit / state */}
            <div className="mt-6 pt-4 border-t border-hub-border/60 text-[11px] text-slate-400 font-sans leading-relaxed">
              <p>
                * 注：本工作台仅记录从本站触发的打开动作。各子项目的实际计算状态、代码环境与本地参数仍由各子系统自主维护。
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
