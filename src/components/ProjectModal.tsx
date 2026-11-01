import React, { useState, useEffect } from 'react';
import { 
  X, ExternalLink, Github, Copy, Check, Star, BookOpen, 
  ArrowLeft, ChevronLeft, ChevronRight, Terminal, Globe, Lock, 
  Zap, Code2, ScrollText, ArrowRight 
} from 'lucide-react';
import { Project, Playbook, ResearchNote } from '../types';
import { PLAYBOOKS } from '../data/playbooks';
import { RESEARCH_NOTES } from '../data/researchNotes';
import { prewarmUrl } from '../utils/prewarm';
import { useToast } from '../context/ToastContext';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  fromPlaybook?: Playbook | null;
  onBackToPlaybook?: () => void;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  onOpenExternal: (project: Project) => void;
  onOpenPlaybook: (playbook: Playbook) => void;
  onOpenResearchNote?: (note: ResearchNote) => void;
  onPrevProject?: () => void;
  onNextProject?: () => void;
  currentIndex?: number;
  totalProjects?: number;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  fromPlaybook,
  onBackToPlaybook,
  isPinned,
  onTogglePin,
  onOpenExternal,
  onOpenPlaybook,
  onOpenResearchNote,
  onPrevProject,
  onNextProject,
  currentIndex = -1,
  totalProjects = 26,
}) => {
  const [copiedCommand, setCopiedCommand] = useState(false);
  const toast = useToast();

  // Esc key, Arrow keys navigation & container prewarm
  useEffect(() => {
    if (!isOpen || !project) return;

    if (project.officialUrl) {
      prewarmUrl(project.officialUrl);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrevProject) {
        e.preventDefault();
        onPrevProject();
      } else if (e.key === 'ArrowRight' && onNextProject) {
        e.preventDefault();
        onNextProject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, project, onClose, onPrevProject, onNextProject]);

  if (!isOpen || !project) return null;

  const isExisting = project.stage === 'existing';
  const isPrototype = project.stage === 'prototype';

  const handleCopyCommand = () => {
    if (project.runCommand) {
      navigator.clipboard.writeText(project.runCommand);
      setCopiedCommand(true);
      toast.success(`已复制 ${project.name} 终端启动命令`);
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  };

  const associatedPlaybooks = PLAYBOOKS.filter((pb) => 
    project.playbookIds.includes(pb.id) ||
    pb.steps.some((s) => s.projectId === project.id)
  );

  const associatedNotes = RESEARCH_NOTES.filter((n) =>
    n.associatedProjectIds.includes(project.id)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50">
        <aside 
          className="w-screen max-w-2xl bg-hub-panel border-l border-hub-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out text-hub-text select-text"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Back to Playbook banner if navigated from Playbook */}
          {fromPlaybook && onBackToPlaybook && (
            <div className="px-5 py-2.5 bg-hub-gold/15 border-b border-hub-gold/30 flex items-center justify-between flex-shrink-0">
              <button
                onClick={onBackToPlaybook}
                className="flex items-center gap-1.5 text-xs font-medium text-hub-gold hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>返回研究路径：路径 {fromPlaybook.letter} · {fromPlaybook.title}</span>
              </button>
              <span className="text-[10px] font-mono text-hub-gold/80">
                路径上下文保护
              </span>
            </div>
          )}

          {/* Drawer Top Navigation Bar */}
          <div className="px-5 py-3.5 sm:px-6 bg-hub-card border-b border-hub-border flex items-center justify-between flex-shrink-0">
            {/* Sequential Navigation & Index Counter */}
            <div className="flex items-center gap-2">
              {onPrevProject && onNextProject && currentIndex >= 0 && (
                <div className="flex items-center gap-1 bg-hub-bg rounded-lg border border-hub-border p-0.5">
                  <button
                    onClick={onPrevProject}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-hub-panel transition-colors"
                    title="上一个工具 (← 方向键)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-mono text-[11px] text-slate-300">
                    {currentIndex + 1} / {totalProjects}
                  </span>
                  <button
                    onClick={onNextProject}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-hub-panel transition-colors"
                    title="下一个工具 (→ 方向键)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                抽屉规范视图
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onTogglePin(project.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isPinned
                    ? 'bg-hub-gold/15 text-hub-gold border-hub-gold/40 hover:bg-hub-gold/25'
                    : 'bg-hub-bg text-slate-400 border-hub-border hover:text-white'
                }`}
                title={isPinned ? '取消常用' : '设为常用'}
              >
                <Star className={`w-4 h-4 ${isPinned ? 'fill-hub-gold text-hub-gold' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-hub-bg hover:bg-hub-cardHover border border-hub-border transition-colors ml-1"
                title="关闭抽屉 (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Title & Identity Header */}
          <div className="px-5 py-4 sm:px-6 border-b border-hub-border bg-gradient-to-b from-hub-card to-hub-panel flex-shrink-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-hub-gold/15 text-hub-gold border border-hub-gold/30 font-bold">
                {project.domainNumber} {project.domainName}
              </span>
              {project.subCategory && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-hub-bg text-slate-300 border border-hub-border">
                  {project.subCategory}
                </span>
              )}
              {isExisting ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-emerald-950/60 text-emerald-400 border-emerald-800/40">
                  已有版本
                </span>
              ) : isPrototype ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-amber-950/40 text-amber-300 border-amber-700/50 flex items-center gap-1">
                  <Code2 className="w-2.5 h-2.5 text-amber-400" />
                  <span>原型算法就绪</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-slate-800 text-slate-400 border-slate-700">
                  规划方向
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-3">
              <span>{project.name}</span>
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1">
              {project.enName}
            </p>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Summary & Description */}
            <section>
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                这个工具做什么
              </h3>
              <p className="text-sm font-semibold text-hub-goldLight mb-2.5 leading-relaxed">
                {project.summary}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-hub-card/60 p-3.5 rounded-xl border border-hub-border/60">
                {project.description}
              </p>
            </section>

            {/* Usage & Access Mode */}
            <section>
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                使用方式与部署规格
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-hub-card border border-hub-border">
                  <span className="text-[10px] text-slate-400 block font-mono mb-1">建设阶段</span>
                  <span className={`text-xs font-semibold ${isExisting ? 'text-emerald-400' : isPrototype ? 'text-amber-300' : 'text-slate-300'}`}>
                    {isExisting ? '已有版本' : isPrototype ? '算法原型就绪' : '规划编制中'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-hub-card border border-hub-border">
                  <span className="text-[10px] text-slate-400 block font-mono mb-1">访问渠道与架构</span>
                  <div className="text-xs font-semibold">
                    {project.officialUrl ? (
                      project.hostingType === 'container' ? (
                        <span className="text-amber-300 flex items-center gap-1.5" title="Railway/Replit 托管，已触发静默容器预热">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <span>云端容器 · 已静默预热</span>
                        </span>
                      ) : (
                        <span className="text-cyan-300 flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-cyan-300" />
                          <span>静态部署 · 秒级直达</span>
                        </span>
                      )
                    ) : isPrototype ? (
                      <span className="text-amber-300">代码原型 / Notebook草稿</span>
                    ) : (
                      <span className="text-slate-300">本地运行环境</span>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-hub-card border border-hub-border">
                  <span className="text-[10px] text-slate-400 block font-mono mb-1">核验状态</span>
                  <span className="text-xs font-semibold text-hub-goldLight truncate block" title={project.verificationStatus}>
                    {project.verificationStatus}
                  </span>
                </div>
              </div>
            </section>

            {/* Prototype Blueprint & Code Snippet (if prototype) */}
            {isPrototype && project.prototypeInfo && (
              <section className="p-4 rounded-xl bg-amber-950/20 border border-amber-700/40 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-mono">
                  <Code2 className="w-4 h-4" />
                  <span>渐进点亮：算法原型与设计底稿 ({project.prototypeInfo.label})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {project.prototypeInfo.description}
                </p>
                {project.prototypeInfo.snippet && (
                  <div className="p-3 rounded-lg bg-hub-bg font-mono text-[11px] text-amber-200/90 overflow-x-auto border border-hub-border/60">
                    <pre>{project.prototypeInfo.snippet}</pre>
                  </div>
                )}
              </section>
            )}

            {/* Associated Research Notes (Knowledge Flywheel) */}
            {associatedNotes.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono text-hub-gold uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>使用该工具沉淀的研究成果 ({associatedNotes.length} 篇)</span>
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {associatedNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        if (onOpenResearchNote) {
                          onClose();
                          onOpenResearchNote(note);
                        }
                      }}
                      className="p-3.5 rounded-xl bg-hub-card hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-hub-gold bg-hub-gold/10 px-1.5 py-0.2 rounded border border-hub-gold/20">
                            路径 {note.playbookLetter}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {note.date}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-hub-goldLight transition-colors">
                          {note.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-hub-gold group-hover:underline flex-shrink-0">
                        <span>阅读底稿全文</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Inputs, Outputs & Scenes */}
            <section>
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                输入与输出
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-hub-card/70 border border-hub-border/70 flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="font-mono text-slate-400 sm:w-20 flex-shrink-0">输入数据：</span>
                  <span className="text-slate-200 flex-1">{project.inputs}</span>
                </div>
                <div className="p-3 rounded-xl bg-hub-card/70 border border-hub-border/70 flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="font-mono text-slate-400 sm:w-20 flex-shrink-0">输出成果：</span>
                  <span className="text-slate-200 flex-1">{project.outputs}</span>
                </div>
                <div className="p-3 rounded-xl bg-hub-card/70 border border-hub-border/70 flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="font-mono text-slate-400 sm:w-20 flex-shrink-0">适用场景：</span>
                  <span className="text-slate-200 flex-1">{project.applicableScenes}</span>
                </div>
              </div>
            </section>

            {/* Tech Stack & Run Command */}
            <section>
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                技术栈与启动方式
              </h3>
              <div className="p-3.5 rounded-xl bg-hub-card border border-hub-border space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">底层技术：</span>
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
                    <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono text-slate-400">
                      <span>终端启动命令：</span>
                      <button
                        onClick={handleCopyCommand}
                        className="text-hub-gold hover:text-white flex items-center gap-1 transition-colors px-2 py-0.5 rounded bg-hub-bg border border-hub-border hover:border-hub-gold/40"
                      >
                        {copiedCommand ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCommand ? '已复制' : '复制命令'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-lg bg-hub-bg font-mono text-xs text-hub-tealLight overflow-x-auto select-all">
                      {project.runCommand}
                    </pre>
                  </div>
                )}
              </div>
            </section>

            {/* Associated Research Playbooks */}
            {associatedPlaybooks.length > 0 && (
              <section>
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  参与的研究路径
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {associatedPlaybooks.map((pb) => (
                    <div
                      key={pb.id}
                      onClick={() => {
                        onClose();
                        onOpenPlaybook(pb);
                      }}
                      className="p-3 rounded-xl bg-hub-card hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/40 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div>
                        <span className="font-mono text-[10px] text-hub-gold font-bold block">
                          路径 {pb.letter}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-200 group-hover:text-hub-goldLight">
                          {pb.title}
                        </h4>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-hub-gold transition-colors" />
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Drawer Footer Actions */}
          <div className="px-5 py-3.5 sm:px-6 border-t border-hub-border bg-hub-card flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center gap-2">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-slate-300 hover:text-white border border-hub-border transition-colors font-mono"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>{project.isRepoPrivate ? '私有代码仓库' : 'GitHub 源码'}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isExisting && project.officialUrl ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenExternal(project);
                  }}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-hub-teal hover:bg-hub-tealLight text-slate-950 font-bold transition-all shadow-sm"
                >
                  <span>立即打开应用</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-hub-panel hover:bg-hub-card text-slate-200 border border-hub-border transition-colors"
                >
                  关闭抽屉
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
