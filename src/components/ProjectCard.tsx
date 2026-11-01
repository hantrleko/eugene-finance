import React from 'react';
import { Star, ExternalLink, Info, Terminal, Globe, Lock, Clock, Zap } from 'lucide-react';
import { Project } from '../types';
import { prewarmUrl } from '../utils/prewarm';

interface ProjectCardProps {
  project: Project;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  onSelectProject: (project: Project) => void;
  onOpenProjectExternal: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isPinned,
  onTogglePin,
  onSelectProject,
  onOpenProjectExternal,
}) => {
  const isExisting = project.stage === 'existing';

  const renderAccessBadge = () => {
    if (project.officialUrl) {
      if (project.hostingType === 'container') {
        return (
          <span 
            className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40"
            title="云端容器 (Railway/Replit)：休眠时首次访问冷启动约10秒，悬停已自动预热"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>云端容器</span>
          </span>
        );
      }
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/40" title="静态极速 (GitHub Pages / Cloudflare)">
          <Zap className="w-2.5 h-2.5 text-cyan-300" />
          <span>静态极速</span>
        </span>
      );
    }
    if (project.accessMode === 'private' || project.isRepoPrivate) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40">
          <Lock className="w-2.5 h-2.5" />
          <span>私有仓库</span>
        </span>
      );
    }
    if (project.accessMode === 'local') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
          <Terminal className="w-2.5 h-2.5" />
          <span>本地运行</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
        <Clock className="w-2.5 h-2.5" />
        <span>规划方向</span>
      </span>
    );
  };

  return (
    <div 
      onMouseEnter={() => prewarmUrl(project.officialUrl)}
      className="group relative flex flex-col justify-between p-5 rounded-xl bg-hub-card/85 hover:bg-hub-cardHover border border-hub-border hover:border-hub-borderHover transition-all duration-150 shadow-sm"
    >
      
      <div>
        {/* Top bar with Domain + SubCategory + Pin Button */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-hub-gold bg-hub-gold/10 px-1.5 py-0.5 rounded border border-hub-gold/20 font-medium">
              {project.domainNumber} {project.domainName}
            </span>
            {project.subCategory && (
              <span className="text-[10px] font-mono text-slate-400 bg-hub-panel px-1.5 py-0.5 rounded border border-hub-border">
                {project.subCategory}
              </span>
            )}
          </div>

          <button
            onClick={() => onTogglePin(project.id)}
            className={`p-1 rounded transition-colors ${
              isPinned
                ? 'text-hub-gold hover:text-amber-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={isPinned ? '取消常用' : '设为常用'}
          >
            <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-hub-gold' : ''}`} />
          </button>
        </div>

        {/* Project Titles */}
        <div className="mb-2">
          <h3 
            onClick={() => onSelectProject(project)}
            className="text-base font-bold text-slate-100 group-hover:text-hub-goldLight cursor-pointer transition-colors"
          >
            {project.name}
          </h3>
          <p className="text-[11px] font-mono text-slate-400 line-clamp-1">
            {project.enName}
          </p>
        </div>

        {/* Summary Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3.5 line-clamp-2">
          {project.summary}
        </p>

        {/* Method Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.methodTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-hub-bg text-slate-400 border border-hub-border"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div>
        {/* Status bar */}
        <div className="pt-3 border-t border-hub-border/60 mb-3 flex items-center justify-between text-[11px] flex-wrap gap-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isExisting
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isExisting ? '已有版本' : '规划中'}
            </span>
            {renderAccessBadge()}
          </div>

          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={project.verificationStatus}>
            {project.verificationStatus}
          </span>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <button
            onClick={() => onSelectProject(project)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white bg-hub-panel hover:bg-hub-card border border-hub-border transition-colors text-xs"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>查看说明</span>
          </button>

          {isExisting ? (
            project.officialUrl ? (
              <button
                onClick={() => onOpenProjectExternal(project)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-hub-teal/20 hover:bg-hub-teal/30 text-hub-tealLight hover:text-white border border-hub-teal/40 font-medium transition-colors text-xs"
              >
                <span>打开应用</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            ) : project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-slate-300 hover:text-white border border-hub-border transition-colors text-xs"
              >
                <span>{project.isRepoPrivate ? '私有仓库' : '查看源码'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                onClick={() => onSelectProject(project)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                本地运行
              </button>
            )
          ) : (
            <button
              onClick={() => onSelectProject(project)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-hub-gold hover:text-hub-goldLight border border-hub-gold/30 transition-colors text-xs font-medium"
            >
              <span>查看方案</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
