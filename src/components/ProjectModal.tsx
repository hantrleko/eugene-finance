import React, { useState } from 'react';
import { X, ExternalLink, Github, Terminal, Copy, Check, Star, BookOpen, Layers, CheckCircle2, Clock } from 'lucide-react';
import { Project, Playbook } from '../types';
import { PLAYBOOKS } from '../data/playbooks';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  onOpenExternal: (project: Project) => void;
  onOpenPlaybook: (playbook: Playbook) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  isPinned,
  onTogglePin,
  onOpenExternal,
  onOpenPlaybook,
}) => {
  const [copiedCommand, setCopiedCommand] = useState(false);

  if (!isOpen || !project) return null;

  const isExisting = project.stage === 'existing';

  const handleCopyCommand = () => {
    if (project.runCommand) {
      navigator.clipboard.writeText(project.runCommand);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  };

  const associatedPlaybooks = PLAYBOOKS.filter((pb) => 
    project.playbookIds.includes(pb.id) ||
    pb.steps.some((s) => s.projectId === project.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-hub-panel border border-hub-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-hub-border bg-hub-card flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-hub-gold/15 text-hub-gold border border-hub-gold/30 font-bold">
                {project.domainNumber} {project.domainName}
              </span>
              {project.subCategory && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-hub-bg text-slate-300 border border-hub-border">
                  {project.subCategory}
                </span>
              )}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isExisting
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isExisting ? '已有版本' : '规划方向'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-3">
              <span>{project.name}</span>
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-400 mt-0.5">
              {project.enName}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onTogglePin(project.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isPinned
                  ? 'bg-hub-gold/10 text-hub-gold border-hub-gold/30 hover:bg-hub-gold/20'
                  : 'bg-hub-bg text-slate-400 border-hub-border hover:text-white'
              }`}
              title={isPinned ? '取消常用' : '设为常用'}
            >
              <Star className={`w-4 h-4 ${isPinned ? 'fill-hub-gold' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-hub-bg hover:bg-hub-cardHover border border-hub-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Summary & Description */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              一句话用途与系统定位
            </h3>
            <p className="text-sm font-semibold text-hub-goldLight mb-2 leading-relaxed">
              {project.summary}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-hub-card/60 p-3.5 rounded-lg border border-hub-border/60">
              {project.description}
            </p>
          </div>

          {/* Three Dimensional Status Grid */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              三维状态与访问特征
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-hub-card border border-hub-border">
                <span className="text-[10px] text-slate-400 block font-mono mb-1">建设阶段</span>
                <span className={`text-xs font-semibold ${isExisting ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {isExisting ? '已有版本 (Active / Developed)' : '规划编制中 (Planned)'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-hub-card border border-hub-border">
                <span className="text-[10px] text-slate-400 block font-mono mb-1">访问方式</span>
                <span className="text-xs font-semibold text-slate-200">
                  {project.accessMode === 'web' && '公开线上网址 (Web / Pages)'}
                  {project.accessMode === 'local' && '本地部署运行 (CLI / Server)'}
                  {project.accessMode === 'private' && '私有代码库 (Private Repo)'}
                  {project.accessMode === 'planned' && '方案规划编制中'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-hub-card border border-hub-border">
                <span className="text-[10px] text-slate-400 block font-mono mb-1">入口核验说明</span>
                <span className="text-xs font-semibold text-hub-goldLight truncate block" title={project.verificationStatus}>
                  {project.verificationStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Inputs, Outputs & Scenes */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              研发生态规范 (I/O & Applications)
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-hub-card/70 border border-hub-border/70 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-mono text-slate-400 sm:w-24 flex-shrink-0">需要输入：</span>
                <span className="text-slate-200 flex-1">{project.inputs}</span>
              </div>
              <div className="p-3 rounded-lg bg-hub-card/70 border border-hub-border/70 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-mono text-slate-400 sm:w-24 flex-shrink-0">产出结果：</span>
                <span className="text-slate-200 flex-1">{project.outputs}</span>
              </div>
              <div className="p-3 rounded-lg bg-hub-card/70 border border-hub-border/70 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-mono text-slate-400 sm:w-24 flex-shrink-0">适用场景：</span>
                <span className="text-slate-200 flex-1">{project.applicableScenes}</span>
              </div>
            </div>
          </div>

          {/* Tech Stack & Run Command */}
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              技术栈与本地启动
            </h3>
            <div className="p-3.5 rounded-lg bg-hub-card border border-hub-border space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">底层技术栈：</span>
                <span className="text-slate-200 font-semibold">{project.techStack}</span>
              </div>

              {project.localPath && (
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">本地代码路径：</span>
                  <span className="text-slate-300 font-mono text-[11px] truncate max-w-[320px]">{project.localPath}</span>
                </div>
              )}

              {project.runCommand && (
                <div className="mt-2 pt-2 border-t border-hub-border/50">
                  <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-slate-400">
                    <span>终端启动命令：</span>
                    <button
                      onClick={handleCopyCommand}
                      className="text-hub-gold hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedCommand ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCommand ? '已复制' : '复制命令'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded bg-hub-bg font-mono text-xs text-hub-tealLight overflow-x-auto">
                    {project.runCommand}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Associated Research Playbooks */}
          {associatedPlaybooks.length > 0 && (
            <div>
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                参与的研究路径 (Connected Playbooks)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {associatedPlaybooks.map((pb) => (
                  <div
                    key={pb.id}
                    onClick={() => {
                      onClose();
                      onOpenPlaybook(pb);
                    }}
                    className="p-3 rounded-lg bg-hub-card hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-hub-gold font-bold block">
                        路径 {pb.letter} · {pb.title}
                      </span>
                      <span className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                        交付物：{pb.finalDeliverable}
                      </span>
                    </div>
                    <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-hub-gold transition-colors flex-shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-hub-border bg-hub-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-cardHover text-xs text-slate-300 hover:text-white border border-hub-border transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>查看源码仓库</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isExisting && (project.officialUrl || project.repoUrl) ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenExternal(project);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-hub-teal hover:bg-hub-teal/90 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
              >
                <span>立即打开项目</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-hub-gold/20 text-hub-gold border border-hub-gold/30 text-xs font-semibold hover:bg-hub-gold/30 transition-colors"
              >
                方案已备忘 · 建设清单就绪
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
