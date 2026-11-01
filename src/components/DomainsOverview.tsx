import React from 'react';
import { DOMAINS } from '../data/domains';
import { DomainId } from '../types';
import { ArrowRight, Layers } from 'lucide-react';

interface DomainsOverviewProps {
  onSelectDomain: (domainId: DomainId) => void;
}

export const DomainsOverview: React.FC<DomainsOverviewProps> = ({ onSelectDomain }) => {
  return (
    <section className="py-12 border-b border-hub-border bg-hub-panel/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-hub-gold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>SIX RESEARCH DOMAINS</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              六大研究与探索领域
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              完整涵盖 16 个已有入口与 10 个规划方向，呈现清晰研究版图
            </p>
          </div>
        </div>

        {/* 3 Columns x 2 Rows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DOMAINS.map((domain) => {
            return (
              <div
                key={domain.id}
                onClick={() => onSelectDomain(domain.id)}
                className="group relative flex flex-col justify-between p-5 rounded-xl bg-hub-card/90 hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-gold-glow"
              >
                <div>
                  {/* Domain Number & EnName */}
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-hub-gold font-bold text-sm tracking-wider">
                      {domain.number}
                    </span>
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider">
                      {domain.enName}
                    </span>
                  </div>

                  {/* Domain Title */}
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-hub-goldLight transition-colors mb-1.5">
                    {domain.name}
                  </h3>

                  {/* Core Question */}
                  <div className="p-2.5 rounded-lg bg-hub-bg/70 border border-hub-border/60 mb-3.5">
                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                      “{domain.question}”
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {domain.description}
                  </p>

                  {/* Representative Tools */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      模块序列：
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-300">
                      {domain.representativeProjects.map((proj, idx) => (
                        <span key={proj} className="flex items-center">
                          <span className="hover:text-hub-goldLight transition-colors">{proj}</span>
                          {idx < domain.representativeProjects.length - 1 && (
                            <span className="text-slate-600 mx-1">·</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Count & Link */}
                <div className="pt-3 border-t border-hub-border/60 flex items-center justify-between text-xs">
                  <div className="font-mono text-[11px] text-slate-400">
                    <span className="text-emerald-400">{domain.existingCount}个已有入口</span>
                    {domain.plannedCount > 0 && (
                      <>
                        <span className="text-slate-600 mx-1">·</span>
                        <span className="text-slate-400">{domain.plannedCount}个规划方向</span>
                      </>
                    )}
                  </div>

                  <span className="text-xs font-medium text-hub-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    浏览领域 <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
