import React from 'react';
import { BookOpen, ArrowRight, CheckCircle2, Database } from 'lucide-react';
import { PLAYBOOKS } from '../data/playbooks';
import { Playbook } from '../types';

interface PlaybooksSectionProps {
  onOpenPlaybook: (playbook: Playbook) => void;
}

export const PlaybooksSection: React.FC<PlaybooksSectionProps> = ({ onOpenPlaybook }) => {
  const getProgress = (id: string) => {
    try {
      const saved = localStorage.getItem(`ef_pb_scratchpad_${id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.completedSteps)) {
          return parsed.completedSteps.length;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  };

  return (
    <section id="playbooks" className="py-10 border-b border-hub-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-hub-gold uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>RESEARCH PLAYBOOKS & WORKFLOWS</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
              研究路径
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              回答“这些工具怎样共同完成一项严肃研究”，从起点到交付成果
            </p>
          </div>
        </div>

        {/* Playbook Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLAYBOOKS.map((playbook) => {
            const completedCount = getProgress(playbook.id);
            const totalSteps = playbook.steps.length;
            const percent = Math.round((completedCount / totalSteps) * 100);

            return (
              <div
                key={playbook.id}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-hub-card hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/40 transition-all duration-150 shadow-sm hairline-highlight"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-hub-gold/20 text-hub-gold border border-hub-gold/30 font-bold">
                        路径 {playbook.letter}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {playbook.enTitle}
                      </span>
                    </div>

                    {completedCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-hub-teal bg-hub-teal/15 px-2 py-0.5 rounded border border-hub-teal/30">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>已完成 {completedCount}/{totalSteps}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-hub-goldLight transition-colors mb-2">
                    {playbook.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">
                    {playbook.subtitle}
                  </p>

                  {/* Progress track if any */}
                  {completedCount > 0 && (
                    <div className="w-full h-1 bg-hub-bg rounded-full overflow-hidden mb-4 border border-hub-border/50">
                      <div 
                        className="h-full bg-hub-teal transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}

                  {/* Visual Stepper Pipeline Track */}
                  <div className="mb-5 pt-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2.5">
                      标准拓扑流水线：
                    </span>

                    <div className="relative pl-3 space-y-3.5 border-l-2 border-hub-border/70 ml-2">
                      {playbook.steps.map((step, idx) => (
                        <div key={step.stepNumber} className="relative flex items-start gap-2.5 text-xs">
                          {/* Stepper node circle */}
                          <div className="absolute -left-[19px] top-0.5 w-3.5 h-3.5 rounded-full bg-hub-card border-2 border-hub-border flex items-center justify-center group-hover:border-hub-gold transition-colors">
                            <div className={`w-1.5 h-1.5 rounded-full ${step.isExisting ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-200 font-semibold truncate text-xs">
                                {step.title}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded flex-shrink-0 ${
                                  step.isExisting
                                    ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                                    : 'text-slate-400 bg-slate-800/80 border border-slate-700/60'
                                }`}
                              >
                                {step.isExisting ? '已有系统' : '规划模块'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block font-mono mt-0.5 truncate">
                              调用：{step.toolName}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverable Badge */}
                  <div className="p-3.5 rounded-xl bg-hub-bg/80 border border-hub-border/70 mb-5">
                    <span className="text-[10px] font-mono text-hub-gold uppercase tracking-wider block mb-0.5 font-bold">
                      终点输出成果：
                    </span>
                    <p className="text-xs font-semibold text-slate-100">
                      {playbook.finalDeliverable}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {playbook.deliverableDescription}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <button
                  onClick={() => onOpenPlaybook(playbook)}
                  className="w-full py-2.5 px-4 rounded-xl bg-hub-panel hover:bg-hub-gold/20 text-hub-goldLight hover:text-white border border-hub-gold/30 hover:border-hub-gold transition-all text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>查看实操指引与交付模板</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
