import React from 'react';
import { BookOpen, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { PLAYBOOKS } from '../data/playbooks';
import { Playbook } from '../types';

interface PlaybooksSectionProps {
  onOpenPlaybook: (playbook: Playbook) => void;
}

export const PlaybooksSection: React.FC<PlaybooksSectionProps> = ({ onOpenPlaybook }) => {
  return (
    <section id="playbooks" className="py-14 border-b border-hub-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-mono text-hub-gold uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>RESEARCH PLAYBOOKS & WORKFLOWS</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              三项首发研究路径
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              回答“这些工具怎样共同完成一项严肃研究”，从起点到交付成果
            </p>
          </div>
        </div>

        {/* Playbook Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLAYBOOKS.map((playbook) => {
            return (
              <div
                key={playbook.id}
                className="group relative flex flex-col justify-between p-6 rounded-xl bg-hub-card/90 hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/50 transition-all duration-200 shadow-sm hover:shadow-gold-glow"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-hub-gold/20 text-hub-gold border border-hub-gold/30 font-bold">
                        路径 {playbook.letter}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        {playbook.enTitle}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-hub-goldLight transition-colors mb-2">
                    {playbook.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-6 line-clamp-3">
                    {playbook.subtitle}
                  </p>

                  {/* Visual Step Timeline */}
                  <div className="space-y-2.5 mb-6">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      执行步骤与工具流：
                    </span>
                    {playbook.steps.map((step, idx) => (
                      <div key={step.stepNumber} className="flex items-center gap-2.5 text-xs">
                        <span className="w-5 h-5 rounded-full bg-hub-bg text-slate-300 font-mono text-[10px] flex items-center justify-center border border-hub-border flex-shrink-0">
                          {step.stepNumber}
                        </span>
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-slate-200 font-medium truncate">
                            {step.toolName}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                              step.isExisting
                                ? 'text-emerald-400 bg-emerald-950/40'
                                : 'text-slate-400 bg-slate-800/80'
                            }`}
                          >
                            {step.isExisting ? '已有' : '规划'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Deliverable Badge */}
                  <div className="p-3 rounded-lg bg-hub-bg/80 border border-hub-border/70 mb-4">
                    <span className="text-[10px] font-mono text-hub-gold uppercase tracking-wider block mb-0.5">
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
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-hub-panel hover:bg-hub-gold/20 text-hub-goldLight hover:text-white border border-hub-gold/30 hover:border-hub-gold transition-all text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm"
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
