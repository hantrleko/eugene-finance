import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, X, ExternalLink, ArrowRight, BookOpen, Layers, 
  CornerDownLeft, Star, Zap, Plus, Sparkles, Sliders 
} from 'lucide-react';
import { PROJECTS } from '../data/projects';
import { PLAYBOOKS } from '../data/playbooks';
import { Project, Playbook } from '../types';
import { prewarmUrl } from '../utils/prewarm';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onSelectPlaybook: (playbook: Playbook) => void;
  onOpenProjectExternal: (project: Project) => void;
  isPinned?: (id: string) => boolean;
  onTogglePin?: (id: string) => void;
  onCreateNewCase?: () => void;
  onOpenToolchainBridge?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onSelectPlaybook,
  onOpenProjectExternal,
  isPinned,
  onTogglePin,
  onCreateNewCase,
  onOpenToolchainBridge,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setSelectedIndex(0);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const rawTrimmed = query.trim();
  const trimmed = rawTrimmed.toLowerCase();

  // Detect if user entered a stock ticker or macro code (e.g. 600036.SH, 600519, 00700.HK, US10Y, CN10Y, DXY)
  const detectedDispatchContext = useMemo(() => {
    if (!rawTrimmed || rawTrimmed.length < 2) return null;
    const upper = rawTrimmed.toUpperCase();

    // Check macro series pattern
    if (/^(US10Y|CN10Y|DXY|DR007|GDP_NOWCAST|VIX|SOFR|LPR)$/i.test(upper)) {
      const normalized = upper;
      const tools = PROJECTS.filter((p) => p.officialUrl && p.queryProtocol?.macroParam);
      return {
        type: 'macro' as const,
        code: normalized,
        label: `宏观/利率序列 [${normalized}]`,
        tools,
      };
    }

    // Check A-share / HK / US ticker pattern (e.g., 600036.SH, 002594.SZ, 00700.HK, or 6 digits)
    if (/^\d{6}(\.(SH|SZ|BJ))?$/i.test(upper) || /^\d{5}\.HK$/i.test(upper)) {
      let normalized = upper;
      if (/^\d{6}$/.test(upper)) {
        normalized = upper.startsWith('6') ? `${upper}.SH` : `${upper}.SZ`;
      }
      const tools = PROJECTS.filter((p) => p.officialUrl && p.queryProtocol?.tickerParam);
      return {
        type: 'stock' as const,
        code: normalized,
        label: `证券标的 [${normalized}]`,
        tools,
      };
    }

    return null;
  }, [rawTrimmed]);

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

  const handleDispatchLaunch = (project: Project, code: string, mode: 'stock' | 'macro') => {
    if (!project.officialUrl) return;
    const qp = project.queryProtocol;
    const params = new URLSearchParams();
    if (mode === 'stock' && qp?.tickerParam) {
      params.set(qp.tickerParam, code);
    } else if (mode === 'macro' && qp?.macroParam) {
      params.set(qp.macroParam, code);
    }
    const qs = params.toString();
    const url = qs ? `${project.officialUrl}?${qs}` : project.officialUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  // Flat list for keyboard navigation
  type ResultItem =
    | { type: 'dispatch'; project: Project; code: string; mode: 'stock' | 'macro' }
    | { type: 'playbook'; item: Playbook }
    | { type: 'project'; item: Project };

  const allResults: ResultItem[] = [
    ...(detectedDispatchContext
      ? detectedDispatchContext.tools.map((p) => ({
          type: 'dispatch' as const,
          project: p,
          code: detectedDispatchContext.code,
          mode: detectedDispatchContext.type,
        }))
      : []),
    ...matchedPlaybooks.map((pb) => ({ type: 'playbook' as const, item: pb })),
    ...matchedProjects.map((p) => ({ type: 'project' as const, item: p })),
  ];

  const totalResults = allResults.length;

  useEffect(() => {
    if (allResults.length > 0 && selectedIndex < allResults.length) {
      const selected = allResults[selectedIndex];
      if (selected.type === 'project' && selected.item.officialUrl) {
        prewarmUrl(selected.item.officialUrl);
      } else if (selected.type === 'dispatch' && selected.project.officialUrl) {
        prewarmUrl(selected.project.officialUrl);
      }
    }
  }, [selectedIndex, allResults]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalResults - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalResults - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults.length > 0 && selectedIndex < allResults.length) {
          const selected = allResults[selectedIndex];
          if (selected.type === 'dispatch') {
            handleDispatchLaunch(selected.project, selected.code, selected.mode);
          } else if (selected.type === 'playbook') {
            onSelectPlaybook(selected.item);
            onClose();
          } else {
            if (e.shiftKey) {
              onSelectProject(selected.item);
              onClose();
            } else {
              if (selected.item.stage === 'existing' && selected.item.officialUrl) {
                onOpenProjectExternal(selected.item);
                onClose();
              } else {
                onSelectProject(selected.item);
                onClose();
              }
            }
          }
        }
      } else if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && !query) {
        if (allResults.length > 0 && selectedIndex < allResults.length) {
          const selected = allResults[selectedIndex];
          if (selected.type === 'project' && onTogglePin) {
            e.preventDefault();
            onTogglePin(selected.item.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, totalResults, allResults, onClose, onSelectPlaybook, onSelectProject, onOpenProjectExternal, onTogglePin, query]);

  if (!isOpen) return null;

  const dispatchOffset = detectedDispatchContext ? detectedDispatchContext.tools.length : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 px-3 sm:px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-hub-panel border border-hub-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-hub-border bg-hub-card">
          <Search className="w-4 h-4 text-hub-gold mr-2.5 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="搜索 26 个工具、方法，或直接输入代码 (如 600036.SH / US10Y) 带参直达..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 text-slate-400 hover:text-white mr-1"
              title="清空搜索"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-hub-bg border border-hub-border/60 text-xs ml-1.5 flex items-center gap-1 transition-colors"
            title="关闭窗口"
          >
            <X className="w-4 h-4" />
            <span className="text-[11px] font-mono hidden sm:inline">ESC</span>
          </button>
        </div>

        {/* Quick Command Pills Bar */}
        <div className="px-4 py-2 bg-hub-bg/80 border-b border-hub-border flex items-center justify-between gap-2 flex-wrap text-[11px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-mono text-[10px]">快捷指令:</span>
            {['600036.SH', '600519.SH', 'US10Y'].map((sample) => (
              <button
                key={sample}
                onClick={() => {
                  setQuery(sample);
                  setSelectedIndex(0);
                }}
                className="px-2 py-0.5 rounded bg-hub-panel hover:bg-hub-card border border-hub-border text-hub-gold font-mono text-[10px] transition-colors"
              >
                ⚡ {sample}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {onCreateNewCase && (
              <button
                onClick={() => {
                  onClose();
                  onCreateNewCase();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-hub-gold/15 hover:bg-hub-gold/25 text-hub-gold border border-hub-gold/30 font-medium text-[10px] transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>新建研究事项</span>
              </button>
            )}
            {onOpenToolchainBridge && (
              <button
                onClick={() => {
                  onClose();
                  onOpenToolchainBridge();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-hub-panel hover:bg-hub-card text-hub-tealLight border border-hub-border font-medium text-[10px] transition-colors"
              >
                <Sparkles className="w-3 h-3 text-hub-teal" />
                <span>工具链演练</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Container */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <p>未找到与 “{query}” 匹配的工具、代码或方法</p>
              <p className="text-xs text-slate-500 mt-1">
                支持输入股票代码 (如 600036.SH)、宏观序列 (US10Y) 或方法名 (逆向DCF、协整、DID)
              </p>
            </div>
          ) : (
            <>
              {/* Direct Parameterized Dispatch Section */}
              {detectedDispatchContext && (
                <div className="mb-3 p-2 rounded-xl bg-hub-card/70 border border-hub-teal/40">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-hub-tealLight flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sliders className="w-3.5 h-3.5 text-hub-teal" />
                      <span>带参直达子系统 · {detectedDispatchContext.label}</span>
                    </span>
                    <span className="text-slate-400">按 Enter 立即注入参数并启动</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {detectedDispatchContext.tools.map((proj, dIdx) => {
                      const isSelected = selectedIndex === dIdx;
                      const paramKey =
                        detectedDispatchContext.type === 'stock'
                          ? proj.queryProtocol?.tickerParam
                          : proj.queryProtocol?.macroParam;
                      return (
                        <div
                          key={`dispatch-${proj.id}`}
                          onClick={() =>
                            handleDispatchLaunch(proj, detectedDispatchContext.code, detectedDispatchContext.type)
                          }
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-hub-panel border-hub-teal text-white shadow-xs'
                              : 'hover:bg-hub-panel/60 border-transparent text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Zap className="w-3.5 h-3.5 text-hub-gold flex-shrink-0" />
                            <span className="text-xs font-bold truncate">
                              用【{proj.name}】分析 {detectedDispatchContext.code}
                            </span>
                            <span className="font-mono text-[10px] text-hub-tealLight bg-hub-bg px-1.5 py-0.2 rounded border border-hub-border">
                              ?{paramKey}={detectedDispatchContext.code}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-hub-gold flex items-center gap-1 flex-shrink-0">
                            <span>直达</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Playbooks Section if matched */}
              {matchedPlaybooks.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-hub-gold flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    <span>匹配研究路径 ({matchedPlaybooks.length})</span>
                  </div>
                  {matchedPlaybooks.map((pb, pbIdx) => {
                    const isSelected = selectedIndex === dispatchOffset + pbIdx;
                    return (
                      <div
                        key={pb.id}
                        onClick={() => {
                          onSelectPlaybook(pb);
                          onClose();
                        }}
                        className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-hub-card border-hub-gold/40 shadow-sm'
                            : 'hover:bg-hub-card/60 border-transparent'
                        }`}
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
                    );
                  })}
                </div>
              )}

              {/* Projects Section */}
              {matchedProjects.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3 h-3" />
                      <span>工具与模块 ({matchedProjects.length})</span>
                    </span>
                    {!query && <span className="text-[10px] lowercase text-slate-400">全部 {PROJECTS.length} 项</span>}
                  </div>
                  {matchedProjects.map((p, pIdx) => {
                    const actualIndex = dispatchOffset + matchedPlaybooks.length + pIdx;
                    const isSelected = selectedIndex === actualIndex;
                    const isExisting = p.stage === 'existing';
                    const pinned = isPinned ? isPinned(p.id) : false;

                    return (
                      <div
                        key={p.id}
                        onMouseEnter={() => {
                          if (p.officialUrl) prewarmUrl(p.officialUrl);
                        }}
                        onClick={() => {
                          onSelectProject(p);
                          onClose();
                        }}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-hub-card border-hub-gold/50 shadow-sm'
                            : 'hover:bg-hub-card/60 border-transparent'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-slate-400">
                              {p.domainNumber}
                            </span>
                            <span className="text-sm font-medium text-slate-200 group-hover:text-hub-goldLight">
                              {p.name}
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
                            {p.hostingType === 'container' && (
                              <span className="text-[9px] font-mono text-amber-400/80 bg-amber-950/30 px-1 rounded border border-amber-800/30">
                                容器
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {p.summary}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {onTogglePin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePin(p.id);
                              }}
                              className={`p-1 rounded transition-colors ${
                                pinned
                                  ? 'text-hub-gold hover:text-amber-300'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                              title={pinned ? '取消常用' : '设为常用 (P)'}
                            >
                              <Star className={`w-3.5 h-3.5 ${pinned ? 'fill-hub-gold' : ''}`} />
                            </button>
                          )}

                          {isExisting && p.officialUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenProjectExternal(p);
                                onClose();
                              }}
                              className="px-2 py-1 text-xs text-hub-teal hover:text-white bg-hub-teal/15 hover:bg-hub-teal/30 rounded border border-hub-teal/30 flex items-center gap-1 transition-colors"
                              title="打开线上应用 (Enter)"
                            >
                              <span>打开</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(p);
                              onClose();
                            }}
                            className="text-xs text-slate-400 group-hover:text-hub-gold transition-colors flex items-center gap-0.5 ml-1"
                            title="查看详情 (Shift+Enter)"
                          >
                            <span className="hidden sm:inline">详情</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info & keyboard tips */}
        <div className="px-4 py-2 border-t border-hub-border bg-hub-card/60 text-[11px] text-slate-400 flex items-center justify-between font-mono flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-hub-bg rounded border border-hub-border text-[10px]">↑</kbd>
              <kbd className="px-1 py-0.5 bg-hub-bg rounded border border-hub-border text-[10px]">↓</kbd>
              <span>选择</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-hub-bg rounded border border-hub-border text-[10px] flex items-center">
                <CornerDownLeft className="w-2.5 h-2.5" />
              </kbd>
              <span>启动/带参直达</span>
            </span>
            <span className="flex items-center gap-1 hidden sm:flex">
              <kbd className="px-1 py-0.5 bg-hub-bg rounded border border-hub-border text-[10px]">Shift+↵</kbd>
              <span>规格</span>
            </span>
            {onTogglePin && (
              <span className="flex items-center gap-1 hidden md:flex">
                <kbd className="px-1 py-0.5 bg-hub-bg rounded border border-hub-border text-[10px]">P</kbd>
                <span>设为常用</span>
              </span>
            )}
          </div>
          <span className="text-[10px]">ESC 退出</span>
        </div>
      </div>
    </div>
  );
};
