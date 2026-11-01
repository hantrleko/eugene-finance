import React from 'react';
import { 
  Plus, ArrowRight, Layers, Calendar, CheckCircle2, 
  Sparkles, Clock, FileText, ChevronRight, Target, Activity 
} from 'lucide-react';
import { ResearchCase } from '../types';

interface ResearchCasesSectionProps {
  cases: ResearchCase[];
  onOpenCase: (c: ResearchCase) => void;
  onCreateNewCase: () => void;
  onOpenToolchainBridge: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToNotes: () => void;
}

export const ResearchCasesSection: React.FC<ResearchCasesSectionProps> = ({
  cases,
  onOpenCase,
  onCreateNewCase,
  onOpenToolchainBridge,
  onNavigateToCatalog,
  onNavigateToNotes,
}) => {
  const activeCases = cases.filter((c) => c.status === 'active').slice(0, 3);

  return (
    <section className="mb-8">
      {/* Top Primary Operation Bar: 新建研究 / 打开工具 / 查看记录 / 贯通演练 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={onCreateNewCase}
          className="p-3.5 rounded-xl bg-gradient-to-r from-hub-gold/20 via-hub-gold/10 to-hub-panel border border-hub-gold/40 hover:border-hub-gold transition-all text-left group shadow-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-hub-gold uppercase tracking-wider font-bold">
              Action 01
            </span>
            <Plus className="w-4 h-4 text-hub-gold group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold text-slate-100 group-hover:text-hub-goldLight">
            新建研究事项
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
            带着具体问题确立路径与对象
          </p>
        </button>

        <button
          onClick={onNavigateToCatalog}
          className="p-3.5 rounded-xl bg-hub-card hover:bg-hub-cardHover border border-hub-border hover:border-hub-teal/40 transition-all text-left group shadow-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-hub-teal uppercase tracking-wider font-bold">
              Action 02
            </span>
            <Layers className="w-4 h-4 text-hub-teal group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold text-slate-100 group-hover:text-hub-tealLight">
            浏览 26 个工具
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
            按六大领域检索规范与启动
          </p>
        </button>

        <button
          onClick={onNavigateToNotes}
          className="p-3.5 rounded-xl bg-hub-card hover:bg-hub-cardHover border border-hub-border hover:border-slate-500 transition-all text-left group shadow-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Action 03
            </span>
            <FileText className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold text-slate-100 group-hover:text-white">
            查阅研究记录库
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
            个人实证底稿与示范样本
          </p>
        </button>

        <button
          onClick={onOpenToolchainBridge}
          className="p-3.5 rounded-xl bg-hub-card hover:bg-hub-cardHover border border-hub-gold/30 hover:border-hub-gold/60 transition-all text-left group shadow-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-hub-gold uppercase tracking-wider font-bold">
              Verified Flow
            </span>
            <Sparkles className="w-4 h-4 text-hub-gold group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold text-slate-100 group-hover:text-hub-goldLight">
            首条工具链贯通演练
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
            年报文本 ➔ 因子工作台 ➔ 回流
          </p>
        </button>
      </div>

      {/* Main Work Area: Active Research Cases Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-hub-border/60">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-hub-gold" />
            <h3 className="text-sm font-bold text-slate-100 font-sans">
              正在推进的研究事项 (Active Research Cases)
            </h3>
            <span className="font-mono text-[10px] bg-hub-gold/15 text-hub-gold px-2 py-0.2 rounded border border-hub-gold/30">
              {activeCases.length} 项在研
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            保存研究问题、提取指标与证据，支持随时继续
          </span>
        </div>

        {activeCases.length === 0 ? (
          <div className="p-8 rounded-2xl bg-hub-card/40 border border-hub-border text-center space-y-3">
            <p className="text-xs text-slate-400">
              当前暂无正在推进的研究事项。点击上方「新建研究事项」，确立一个具体命题开启研究。
            </p>
            <button
              onClick={onCreateNewCase}
              className="px-4 py-2 rounded-lg bg-hub-gold text-slate-950 font-bold text-xs"
            >
              新建第一个研究事项
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeCases.map((c) => {
              const completedCount = c.steps.filter((s) => s.completed).length;
              const currentStep = c.steps.find((s) => !s.completed) || c.steps[c.steps.length - 1];
              const progressPercent = Math.round((completedCount / c.steps.length) * 100);

              return (
                <div
                  key={c.id}
                  onClick={() => onOpenCase(c)}
                  className="p-4 rounded-2xl bg-hub-card hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/50 cursor-pointer transition-all duration-150 flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    {/* Badges */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                      <span className="px-2 py-0.5 rounded bg-hub-gold/15 text-hub-gold border border-hub-gold/30 font-bold">
                        路径 {c.playbookLetter}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{c.asOfDate}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-hub-goldLight transition-colors leading-snug mb-1.5 line-clamp-1">
                      {c.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 font-serif italic">
                      “{c.question}”
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>进度: {completedCount} / {c.steps.length} 步</span>
                        <span className="text-hub-gold font-bold">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-hub-bg overflow-hidden border border-hub-border/60">
                        <div 
                          className="h-full bg-gradient-to-r from-hub-gold to-emerald-400 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Next step teaser */}
                    <div className="p-2.5 rounded-lg bg-hub-bg/70 border border-hub-border/60 text-[11px] text-slate-300">
                      <span className="text-[10px] text-slate-500 font-mono block">下一步：</span>
                      <span className="font-semibold text-slate-200 line-clamp-1">
                        步骤 {currentStep.stepNumber}：{currentStep.title}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-hub-border/50 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-hub-tealLight">
                      标的：{c.targetName}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-hub-gold group-hover:translate-x-0.5 transition-transform">
                      <span>继续研究</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
