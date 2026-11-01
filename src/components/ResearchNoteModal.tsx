import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, Copy, Download, Calendar, User, BookOpen, 
  Layers, ArrowRight, ExternalLink, FileText, Eye, Code2, 
  Quote, Hash, Sparkles 
} from 'lucide-react';
import { ResearchNote, Project } from '../types';
import { PROJECTS } from '../data/projects';
import { useToast } from '../context/ToastContext';

interface ResearchNoteModalProps {
  note: ResearchNote | null;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onOpenProjectExternal: (project: Project) => void;
}

interface TocItem {
  id: string;
  title: string;
  level: number;
}

export const ResearchNoteModal: React.FC<ResearchNoteModalProps> = ({
  note,
  onClose,
  onSelectProject,
  onOpenProjectExternal,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'reading' | 'source'>('reading');
  const toast = useToast();

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

  // Extract Table of Contents from Markdown headers
  const toc = useMemo<TocItem[]>(() => {
    if (!note) return [];
    const lines = note.contentMarkdown.split('\n');
    const items: TocItem[] = [];
    lines.forEach((line, idx) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);
      if (h2Match) {
        items.push({
          id: `sec-${idx}`,
          title: h2Match[1].trim(),
          level: 2,
        });
      } else if (h3Match) {
        items.push({
          id: `sec-${idx}`,
          title: h3Match[1].trim(),
          level: 3,
        });
      }
    });
    return items;
  }, [note]);

  if (!note) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(note.contentMarkdown);
    setCopied(true);
    toast.success('已复制完整研究底稿 (Markdown)');
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
    toast.info(`已生成下载文件: ${note.id}.md`);
  };

  const associatedProjects = note.associatedProjectIds
    .map((id) => PROJECTS.find((p) => p.id === id))
    .filter((p): p is Project => Boolean(p));

  const scrollToSection = (secId: string) => {
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to render markdown text with bold, italic, code, math highlights
  const renderInlineMarkdown = (text: string): React.ReactNode => {
    // Process math spans: $...$
    const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1);
        return (
          <span 
            key={pIdx} 
            className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-hub-panel border border-hub-gold/30 text-hub-goldLight font-mono text-[11px] italic"
          >
            {mathContent}
          </span>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="text-slate-100 font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={pIdx} className="px-1.5 py-0.5 rounded bg-hub-panel text-hub-tealLight font-mono text-[11px] border border-hub-border">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Render structured editorial content
  const renderEditorialContent = () => {
    const lines = note.contentMarkdown.split('\n');
    const elements: React.ReactNode[] = [];
    let currentQuote: string[] = [];
    let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = (keyPrefix: number) => {
      if (!listBuffer) return;
      if (listBuffer.type === 'ul') {
        elements.push(
          <ul key={`ul-${keyPrefix}`} className="space-y-1.5 my-3 pl-4 list-disc text-slate-300 text-xs sm:text-sm leading-relaxed">
            {listBuffer.items.map((item, iIdx) => (
              <li key={iIdx}>{renderInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${keyPrefix}`} className="space-y-2 my-3 pl-5 list-decimal text-slate-300 text-xs sm:text-sm leading-relaxed">
            {listBuffer.items.map((item, iIdx) => (
              <li key={iIdx}>{renderInlineMarkdown(item)}</li>
            ))}
          </ol>
        );
      }
      listBuffer = null;
    };

    const flushQuote = (keyPrefix: number) => {
      if (currentQuote.length === 0) return;
      elements.push(
        <div key={`quote-${keyPrefix}`} className="my-4 p-4 rounded-xl bg-hub-gold/10 border-l-4 border-hub-gold text-slate-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
          <Quote className="w-5 h-5 text-hub-gold flex-shrink-0 mt-0.5 opacity-80" />
          <div className="space-y-1 flex-1 font-serif italic text-slate-200">
            {currentQuote.map((q, qIdx) => (
              <p key={qIdx}>{renderInlineMarkdown(q)}</p>
            ))}
          </div>
        </div>
      );
      currentQuote = [];
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Heading 1 (# ...)
      if (trimmed.startsWith('# ')) {
        flushList(idx);
        flushQuote(idx);
        // H1 is already in modal header, skip or render subtly
        return;
      }

      // Heading 2 (## ...)
      if (trimmed.startsWith('## ')) {
        flushList(idx);
        flushQuote(idx);
        const titleText = trimmed.replace(/^##\s+/, '');
        elements.push(
          <div key={`h2-${idx}`} id={`sec-${idx}`} className="pt-6 pb-2 border-b border-hub-border/70 scroll-mt-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-hub-gold"></span>
              <span>{titleText}</span>
            </h3>
          </div>
        );
        return;
      }

      // Heading 3 (### ...)
      if (trimmed.startsWith('### ')) {
        flushList(idx);
        flushQuote(idx);
        const titleText = trimmed.replace(/^###\s+/, '');
        elements.push(
          <h4 key={`h3-${idx}`} id={`sec-${idx}`} className="text-sm font-semibold text-hub-goldLight pt-3 pb-1 scroll-mt-6">
            {titleText}
          </h4>
        );
        return;
      }

      // Horizontal separator
      if (trimmed === '---') {
        flushList(idx);
        flushQuote(idx);
        elements.push(<hr key={`hr-${idx}`} className="my-5 border-hub-border/50" />);
        return;
      }

      // Blockquotes (> ...)
      if (trimmed.startsWith('>')) {
        flushList(idx);
        const quoteText = trimmed.replace(/^>\s*/, '');
        currentQuote.push(quoteText);
        return;
      } else {
        flushQuote(idx);
      }

      // Unordered lists (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.replace(/^[-*]\s+/, '');
        if (!listBuffer || listBuffer.type !== 'ul') {
          flushList(idx);
          listBuffer = { type: 'ul', items: [itemText] };
        } else {
          listBuffer.items.push(itemText);
        }
        return;
      }

      // Ordered lists (1. 2.)
      if (/^\d+\.\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^\d+\.\s+/, '');
        if (!listBuffer || listBuffer.type !== 'ol') {
          flushList(idx);
          listBuffer = { type: 'ol', items: [itemText] };
        } else {
          listBuffer.items.push(itemText);
        }
        return;
      }

      // Standard paragraph
      flushList(idx);
      if (trimmed.length > 0) {
        // Check if paragraph is a mathematical formula definition
        const isFormulaCard = trimmed.includes('$$') || (trimmed.startsWith('**') && trimmed.includes('='));
        if (isFormulaCard) {
          elements.push(
            <div key={`formula-${idx}`} className="my-3 p-3.5 rounded-xl bg-hub-card border border-hub-gold/30 hairline-highlight flex items-center justify-between text-xs sm:text-sm font-mono text-hub-goldLight">
              <div>{renderInlineMarkdown(trimmed)}</div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-hub-gold/15 text-hub-gold border border-hub-gold/30">
                Formula
              </span>
            </div>
          );
        } else {
          elements.push(
            <p key={`p-${idx}`} className="my-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {renderInlineMarkdown(trimmed)}
            </p>
          );
        }
      }
    });

    flushList(lines.length);
    flushQuote(lines.length);

    return elements;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-hub-panel border border-hub-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-hub-border bg-hub-card flex items-start justify-between gap-4 flex-shrink-0">
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
            <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">
              {note.subtitle}
            </p>
          </div>

          {/* Action buttons & mode toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-hub-bg rounded-lg p-0.5 border border-hub-border">
              <button
                onClick={() => setViewMode('reading')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  viewMode === 'reading'
                    ? 'bg-hub-panel text-hub-gold font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="精读排版视图"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">精读</span>
              </button>
              <button
                onClick={() => setViewMode('source')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  viewMode === 'source'
                    ? 'bg-hub-panel text-hub-gold font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Markdown 源码视图"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">源码</span>
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-hub-bg hover:bg-hub-cardHover border border-hub-border text-xs transition-colors hidden sm:flex items-center gap-1"
              title="下载 Markdown 原文"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.md</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-semibold text-xs transition-colors shadow-sm flex items-center gap-1"
              title="复制 Markdown 全文"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden sm:inline">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">复制</span>
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

        {/* Deliverable Metrics / Quantitative highlights banner */}
        {note.metrics && note.metrics.length > 0 && (
          <div className="px-5 py-3 sm:px-6 bg-hub-bg/60 border-b border-hub-border grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
            {note.metrics.map((m, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-hub-card/60 border border-hub-border/60">
                <span className="text-[10px] text-slate-400 block font-mono mb-0.5">{m.label}</span>
                <span className="text-sm font-bold text-hub-goldLight font-mono block">{m.value}</span>
                {m.hint && <span className="text-[10px] text-slate-500 font-sans block truncate" title={m.hint}>{m.hint}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Interactive Table of Contents (TOC) quick jumps */}
        {viewMode === 'reading' && toc.length > 0 && (
          <div className="px-5 py-2 sm:px-6 bg-hub-card/40 border-b border-hub-border/60 flex items-center gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 flex-shrink-0">
              <Hash className="w-3 h-3 text-hub-gold" />
              <span>快速导航：</span>
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="px-2.5 py-1 rounded-full bg-hub-panel hover:bg-hub-card text-[11px] text-slate-300 hover:text-hub-gold border border-hub-border/70 whitespace-nowrap transition-colors flex-shrink-0"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
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

          {/* Key Findings Callout (Executive Summary) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-hub-gold/10 via-hub-teal/5 to-transparent border border-hub-gold/30 space-y-2">
            <h3 className="text-xs font-mono text-hub-gold uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-hub-gold" />
              <span>核心研判与非共识洞察摘要 (Executive Summary)</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-200 leading-relaxed list-disc list-inside">
              {note.keyFindings.map((finding, fIdx) => (
                <li key={fIdx} className="text-slate-200">
                  <span className="text-slate-200">{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Article Body based on view mode */}
          {viewMode === 'reading' ? (
            <div className="p-6 rounded-2xl bg-hub-card/90 border border-hub-border font-sans shadow-inner">
              {renderEditorialContent()}
            </div>
          ) : (
            <div className="rounded-2xl bg-hub-card/90 border border-hub-border p-4 font-mono text-xs text-slate-200 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
              {note.contentMarkdown}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 sm:px-6 border-t border-hub-border bg-hub-card flex items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0">
          <span>沉淀于 Eugene Finance 个人知识飞轮 · 严谨求证</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-hub-panel hover:bg-hub-card text-slate-300 hover:text-white border border-hub-border transition-colors"
          >
            关闭 (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
