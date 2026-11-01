import React from 'react';
import { Star, ExternalLink, Info, CheckCircle, Clock, Terminal, Globe, Lock } from 'lucide-react';
import { Project } from '../types';

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

  // Access mode badge
  const renderAccessBadge = () => {
    switch (project.accessMode) {
      case 'web':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/40">
            <Globe className="w-2.5 h-2.5" />
            <span>公开网址</span>
          </span>
        );
      case 'local':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
            <Terminal className="w-2.5 h-2.5" />
            <span>本地运行</span>
          </span>
        );
      case 'private':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40">
            <Lock className="w-2.5 h-2.5" />
            <span>私有代码库</span>
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-2.5 h-2.5" />
            <span>方案规划</span>
          </span>
        );
    }
  };

  return (
    <div className="group relative flex flex-col justify-between p-5 rounded-xl bg-hub-card/85 hover:bg-hub-cardHover border border-hub-border hover:border-hub-borderHover transition-all duration-200 shadow-sm hover:shadow-subtle">
      
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
        <div className="mb-2.5">
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
        {/* Status dimensions bar */}
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
            (project.officialUrl || project.repoUrl) ? (
              <button
                onClick={() => onOpenProjectExternal(project)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-hub-teal/20 hover:bg-hub-teal/30 text-hub-tealLight hover:text-white border border-hub-teal/40 font-medium transition-colors text-xs"
              >
                <span>打开项目</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={() => onSelectProject(project)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                查看代码库
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
