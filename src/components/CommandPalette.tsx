import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ExternalLink, ArrowRight, Star, Compass, BookOpen, Layers } from 'lucide-react';
import { PROJECTS } from '../data/projects';
import { PLAYBOOKS } from '../data/playbooks';
import { Project, Playbook } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onSelectPlaybook: (playbook: Playbook) => void;
  onOpenProjectExternal: (project: Project) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onSelectPlaybook,
  onOpenProjectExternal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global keydown for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter projects
  const trimmed = query.trim().toLowerCase();

  const matchedProjects = PROJECTS.filter((p) => {
    if (!trimmed) return true;
    return (
      p.name.toLowerCase().includes(trimmed) ||
      p.enName.toLowerCase().includes(trimmed) ||
      p.aliases.some((a) => a.toLowerCase().includes(trimmed)) ||
      p.summary.toLowerCase().includes(trimmed) ||
      p.domainName.toLowerCase().includes(trimmed) ||
      p.methodTags.some((t) => t.toLowerCase().includes(trimmed)) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(trimmed))
    );
  });

  const matchedPlaybooks = PLAYBOOKS.filter((pb) => {
    if (!trimmed) return false;
    return (
      pb.title.toLowerCase().includes(trimmed) ||
      pb.enTitle.toLowerCase().includes(trimmed) ||
      pb.subtitle.toLowerCase().includes(trimmed) ||
      pb.finalDeliverable.toLowerCase().includes(trimmed)
    );
  });

  const totalResults = matchedProjects.length + matchedPlaybooks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-hub-panel border border-hub-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-hub-border bg-hub-card">
          <Search className="w-5 h-5 text-hub-gold mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="输入项目名、方法标签、英文名或研究问题..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-hub-bg border border-hub-border text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <p>未找到与 “{query}” 匹配的项目或方法</p>
              <p className="text-xs text-slate-500 mt-1">
                支持搜索：年报文本、协整、VaR、逆向DCF、LOB、期权曲面、陕西沙盘等
              </p>
            </div>
          ) : (
            <>
              {/* Playbooks Section if matched */}
              {matchedPlaybooks.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-hub-gold flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    <span>匹配研究路径 ({matchedPlaybooks.length})</span>
                  </div>
                  {matchedPlaybooks.map((pb) => (
                    <div
                      key={pb.id}
                      onClick={() => {
                        onSelectPlaybook(pb);
                        onClose();
                      }}
                      className="group flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-hub-card hover:border-hub-gold/30 border border-transparent cursor-pointer transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-hub-gold/15 text-hub-gold font-semibold">
                            路径 {pb.letter}
                          </span>
                          <span className="text-sm font-medium text-slate-200 group-hover:text-hub-goldLight">
                            {pb.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          终点：{pb.finalDeliverable}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-hub-gold transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {/* Projects Section */}
              {matchedProjects.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3 h-3" />
                      <span>项目与工具登记项 ({matchedProjects.length})</span>
                    </span>
                    {!query && <span className="text-[10px] lowercase text-slate-400">全部26项</span>}
                  </div>
                  {matchedProjects.map((p) => {
                    const isExisting = p.stage === 'existing';
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProject(p);
                          onClose();
                        }}
                        className="group flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-hub-card hover:border-hub-border border border-transparent cursor-pointer transition-all"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-slate-400">
                              {p.domainNumber}
                            </span>
                            <span className="text-sm font-medium text-slate-200 group-hover:text-hub-goldLight">
                              {p.name}
                            </span>
                            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                              {p.enName}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                isExisting
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {isExisting ? '已有版本' : '规划中'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {p.summary}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isExisting && (p.officialUrl || p.repoUrl) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenProjectExternal(p);
                              }}
                              className="p-1.5 text-slate-400 hover:text-hub-teal hover:bg-hub-bg rounded transition-colors"
                              title="直接打开"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <span className="text-xs text-hub-gold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            详情 <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts tip */}
        <div className="px-4 py-2 border-t border-hub-border bg-hub-card/50 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>单击条目查看完整规范与指令</span>
          <span>按 ESC 键退出</span>
        </div>
      </div>
    </div>
  );
};
