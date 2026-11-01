import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Download, Calendar, User, BookOpen, Layers, ArrowRight, ExternalLink } from 'lucide-react';
import { ResearchNote, Project } from '../types';
import { PROJECTS } from '../data/projects';

interface ResearchNoteModalProps {
  note: ResearchNote | null;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onOpenProjectExternal: (project: Project) => void;
}

export const ResearchNoteModal: React.FC<ResearchNoteModalProps> = ({
  note,
  onClose,
  onSelectProject,
  onOpenProjectExternal,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!note) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(note.contentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([note.contentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const associatedProjects = note.associatedProjectIds
    .map((id) => PROJECTS.find((p) => p.id === id))
    .filter((p): p is Project => Boolean(p));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-hub-panel border border-hub-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-hub-border bg-hub-card flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-hub-gold/15 text-hub-gold border border-hub-gold/30 font-bold">
                路径 {note.playbookLetter} · {note.playbookTitle}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-hub-bg text-slate-300 border border-hub-border">
                {note.domainName}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{note.date}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <User className="w-3 h-3 text-slate-500" />
                <span>{note.author}</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
              {note.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {note.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-hub-bg hover:bg-hub-cardHover border border-hub-border text-xs transition-colors hidden sm:flex items-center gap-1"
              title="下载 Markdown 原文"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 .md</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-semibold text-xs transition-colors shadow-sm flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden sm:inline">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">复制全文</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-hub-bg hover:bg-hub-cardHover border border-hub-border transition-colors ml-1"
              title="关闭 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Deliverable Metrics / Highlights banner */}
        {note.metrics && note.metrics.length > 0 && (
          <div className="px-5 py-3 sm:px-6 bg-hub-bg/60 border-b border-hub-border grid grid-cols-2 sm:grid-cols-4 gap-3">
            {note.metrics.map((m, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-hub-card/60 border border-hub-border/60">
                <span className="text-[10px] text-slate-400 block font-mono mb-0.5">{m.label}</span>
                <span className="text-sm font-bold text-hub-goldLight font-mono block">{m.value}</span>
                {m.hint && <span className="text-[10px] text-slate-500 font-sans block truncate" title={m.hint}>{m.hint}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Associated Toolchain Bar */}
          <div className="p-3.5 rounded-xl bg-hub-card/60 border border-hub-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-hub-teal" />
              <span className="text-xs font-mono text-slate-300 font-semibold">
                本次研究所调用的工具链 ({associatedProjects.length})：
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {associatedProjects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    onClose();
                    onSelectProject(proj);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-hub-panel hover:bg-hub-card text-xs text-hub-goldLight border border-hub-border hover:border-hub-gold/40 transition-colors flex items-center gap-1"
                  title="点击查看工具规格与逻辑"
                >
                  <span>{proj.name}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Key Findings Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-hub-gold/10 via-hub-teal/5 to-transparent border border-hub-gold/30 space-y-2">
            <h3 className="text-xs font-mono text-hub-gold uppercase tracking-wider font-bold">
              核心研判与非共识洞察摘要 (Executive Summary)
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-200 leading-relaxed list-disc list-inside">
              {note.keyFindings.map((finding, fIdx) => (
                <li key={fIdx} className="text-slate-200">
                  <span className="text-slate-200">{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full Markdown Text */}
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="p-5 rounded-xl bg-hub-card/90 border border-hub-border font-sans text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
              {note.contentMarkdown}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 sm:px-6 border-t border-hub-border bg-hub-card flex items-center justify-between text-xs font-mono text-slate-400">
          <span>沉淀于 Eugene Finance 个人知识飞轮</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-hub-panel hover:bg-hub-card text-slate-300 hover:text-white border border-hub-border transition-colors"
          >
            关闭 (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
