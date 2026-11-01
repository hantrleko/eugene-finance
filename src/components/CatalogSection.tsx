import React, { useState } from 'react';
import { Layers, Search, RotateCcw } from 'lucide-react';
import { PROJECTS } from '../data/projects';
import { DOMAINS } from '../data/domains';
import { DomainId, TargetGoal, Stage, Project } from '../types';
import { ProjectCard } from './ProjectCard';
import { DomainsOverview } from './DomainsOverview';

interface CatalogSectionProps {
  selectedDomain: DomainId | 'all';
  onSelectDomain: (domain: DomainId | 'all') => void;
  selectedGoal: TargetGoal | 'all';
  onSelectGoal: (goal: TargetGoal | 'all') => void;
  isPinned: (id: string) => boolean;
  onTogglePin: (id: string) => void;
  onSelectProject: (project: Project) => void;
  onOpenProjectExternal: (project: Project) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  selectedDomain,
  onSelectDomain,
  selectedGoal,
  onSelectGoal,
  isPinned,
  onTogglePin,
  onSelectProject,
  onOpenProjectExternal,
}) => {
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic counts derived from PROJECTS
  const totalCount = PROJECTS.length;
  const totalExisting = PROJECTS.filter((p) => p.stage === 'existing').length;
  const totalPlanned = PROJECTS.filter((p) => p.stage === 'planned').length;

  // Filtering
  const filteredProjects = PROJECTS.filter((p) => {
    // Domain match
    if (selectedDomain !== 'all' && p.domainId !== selectedDomain) return false;

    // Target goal match
    if (selectedGoal !== 'all' && !p.targetGoals.includes(selectedGoal)) return false;

    // Stage match
    if (stageFilter !== 'all' && p.stage !== stageFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.enName.toLowerCase().includes(q) ||
        p.aliases.some((a) => a.toLowerCase().includes(q)) ||
        p.summary.toLowerCase().includes(q) ||
        p.methodTags.some((t) => t.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const resetAllFilters = () => {
    onSelectDomain('all');
    onSelectGoal('all');
    setStageFilter('all');
    setSearchQuery('');
  };

  const isFiltered = selectedDomain !== 'all' || selectedGoal !== 'all' || stageFilter !== 'all' || searchQuery !== '';

  return (
    <section id="catalog" className="py-10 border-b border-hub-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Six Domains Overview Cards */}
        <DomainsOverview
          onSelectDomain={(dId) => {
            onSelectDomain(dId);
            const filterEl = document.getElementById('catalog-filter-bar');
            if (filterEl) {
              filterEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* Section Header */}
        <div id="catalog-filter-bar" className="mb-6 pt-4 border-t border-hub-border/60">
          <div className="flex items-center gap-2 text-xs font-mono text-hub-gold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>ALL TOOLS DIRECTORY</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-3">
              <span>全部工具</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                共 {totalCount} 个工具
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              六大领域归档，支持目标与状态多维筛选
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-xl bg-hub-panel/80 border border-hub-border space-y-4 mb-6">
          
          {/* Domain Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                归档领域：
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onSelectDomain('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedDomain === 'all'
                    ? 'bg-hub-gold text-slate-950 font-bold shadow-sm'
                    : 'bg-hub-card text-slate-300 hover:bg-hub-cardHover border border-hub-border'
                }`}
              >
                全部领域 ({totalCount})
              </button>

              {DOMAINS.map((d) => {
                const countInDomain = PROJECTS.filter((p) => p.domainId === d.id).length;
                const isSelected = selectedDomain === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => onSelectDomain(d.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-hub-gold text-slate-950 font-semibold shadow-sm'
                        : 'bg-hub-card text-slate-300 hover:bg-hub-cardHover border border-hub-border'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-75">{d.number}</span>
                    <span>{d.name}</span>
                    <span className="font-mono text-[10px] opacity-60">({countInDomain})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Goals + Stage + Search Row */}
          <div className="pt-3 border-t border-hub-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            
            {/* Target Goals */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-slate-400 text-[11px]">目标筛选：</span>
              <button
                onClick={() => onSelectGoal('all')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedGoal === 'all'
                    ? 'bg-hub-bg text-slate-100 border border-slate-500 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                全部目标
              </button>
              <button
                onClick={() => onSelectGoal('academic')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedGoal === 'academic'
                    ? 'bg-hub-gold/20 text-hub-goldLight border border-hub-gold/40 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                提升学术能力
              </button>
              <button
                onClick={() => onSelectGoal('company')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedGoal === 'company'
                    ? 'bg-hub-teal/20 text-hub-tealLight border border-hub-teal/40 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                研究公司与行业
              </button>
              <button
                onClick={() => onSelectGoal('investment')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedGoal === 'investment'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                形成投资判断
              </button>
            </div>

            {/* Stage filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400 text-[11px]">建设阶段：</span>
              <div className="flex items-center bg-hub-card rounded-lg border border-hub-border p-0.5">
                <button
                  onClick={() => setStageFilter('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    stageFilter === 'all' ? 'bg-hub-panel text-slate-100 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setStageFilter('existing')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    stageFilter === 'existing' ? 'bg-emerald-950/60 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  已有 ({totalExisting})
                </button>
                <button
                  onClick={() => setStageFilter('planned')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    stageFilter === 'planned' ? 'bg-slate-800 text-slate-300 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  规划 ({totalPlanned})
                </button>
              </div>

              {isFiltered && (
                <button
                  onClick={resetAllFilters}
                  className="flex items-center gap-1 text-[11px] text-hub-gold hover:underline ml-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重置所有</span>
                </button>
              )}
            </div>

          </div>

          {/* Quick text filter input */}
          <div className="pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="在当前列表中快速过滤（输入名称、别名、方法标签）..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-hub-card border border-hub-border text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:border-hub-gold/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  清空
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Results Info Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-4 px-1">
          <span>
            符合当前筛选条件：<strong className="text-hub-gold">{filteredProjects.length}</strong> / {totalCount} 个工具
          </span>
          {stageFilter === 'existing' && (
            <span className="text-emerald-400 text-[11px]">展示 {totalExisting} 个已有版本入口</span>
          )}
          {stageFilter === 'planned' && (
            <span className="text-slate-400 text-[11px]">展示 {totalPlanned} 个规划方向</span>
          )}
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-hub-panel/40 border border-hub-border">
            <p className="text-sm font-semibold text-slate-300 mb-1">未找到符合条件的工具</p>
            <p className="text-xs text-slate-400 mb-4">请尝试放宽筛选条件或清空搜索关键词</p>
            <button
              onClick={resetAllFilters}
              className="px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-hub-gold border border-hub-gold/30 text-xs font-mono"
            >
              重置所有筛选器
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isPinned={isPinned(project.id)}
                onTogglePin={onTogglePin}
                onSelectProject={onSelectProject}
                onOpenProjectExternal={onOpenProjectExternal}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
