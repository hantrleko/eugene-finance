import React from 'react';
import { Search, GraduationCap, Building2, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { TargetGoal } from '../types';

interface HeroProps {
  onOpenSearch: () => void;
  onSelectTargetGoal: (goal: TargetGoal) => void;
  activeGoal: TargetGoal | null;
}

export const Hero: React.FC<HeroProps> = ({ onOpenSearch, onSelectTargetGoal, activeGoal }) => {
  return (
    <section className="relative pt-8 pb-8 sm:pt-12 sm:pb-10 border-b border-hub-border overflow-hidden bg-grid-pattern">
      {/* Background radial accent glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-hub-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Subtle Pre-header badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hub-panel/80 border border-hub-border text-xs text-slate-300 mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-hub-gold" />
          <span className="font-mono text-hub-gold text-[11px] font-medium tracking-wider uppercase">
            EUGENE FINANCE
          </span>
          <span className="text-slate-500">·</span>
          <span>研究与决策工作台</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-100 mb-2.5 font-sans leading-tight">
          研究与创作，<span className="gold-gradient-text">在此汇集。</span>
        </h1>
        
        {/* Concised Sub-headline */}
        <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-6">
          从数据与方法出发，形成行业理解与投资判断。
        </p>

        {/* Global Search Bar */}
        <div className="max-w-xl mx-auto mb-5">
          <div 
            onClick={onOpenSearch}
            className="flex items-center w-full px-4 py-2.5 sm:py-3 rounded-xl bg-hub-panel/90 border border-hub-border hover:border-hub-gold/60 text-slate-400 cursor-pointer shadow-subtle hover:shadow-gold-glow transition-all group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-hub-gold transition-colors mr-2.5" />
            <span className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-200 transition-colors flex-1 text-left truncate">
              搜索工具、方法或研究任务 (Ctrl+K)
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-hub-bg border border-hub-border text-slate-400 group-hover:border-hub-gold/40 group-hover:text-hub-gold transition-colors">
              Ctrl K
            </span>
          </div>
        </div>

        {/* Three Target Goals Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs">
          <span className="text-slate-400 font-mono text-[11px] mr-1 hidden sm:inline">
            聚焦目标：
          </span>

          <button
            onClick={() => onSelectTargetGoal('academic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              activeGoal === 'academic'
                ? 'bg-hub-gold/15 border-hub-gold text-hub-goldLight shadow-sm font-medium'
                : 'bg-hub-panel/60 border-hub-border text-slate-300 hover:border-slate-500 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-hub-gold" />
            <span>提升学术能力</span>
            {activeGoal === 'academic' && <ArrowRight className="w-3 h-3 text-hub-gold" />}
          </button>

          <button
            onClick={() => onSelectTargetGoal('company')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              activeGoal === 'company'
                ? 'bg-hub-teal/15 border-hub-teal text-hub-tealLight shadow-sm font-medium'
                : 'bg-hub-panel/60 border-hub-border text-slate-300 hover:border-slate-500 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-hub-teal" />
            <span>研究公司与行业</span>
            {activeGoal === 'company' && <ArrowRight className="w-3 h-3 text-hub-teal" />}
          </button>

          <button
            onClick={() => onSelectTargetGoal('investment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              activeGoal === 'investment'
                ? 'bg-indigo-500/15 border-indigo-400 text-indigo-200 shadow-sm font-medium'
                : 'bg-hub-panel/60 border-hub-border text-slate-300 hover:border-slate-500 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>形成投资判断</span>
            {activeGoal === 'investment' && <ArrowRight className="w-3 h-3 text-indigo-300" />}
          </button>

          {activeGoal && (
            <button
              onClick={() => onSelectTargetGoal(activeGoal)}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-4 ml-1"
            >
              重置筛选
            </button>
          )}
        </div>

      </div>
    </section>
  );
};
