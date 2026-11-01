import React from 'react';
import { DOMAINS } from '../data/domains';
import { PROJECTS } from '../data/projects';
import { DomainId } from '../types';
import { ArrowRight, Layers } from 'lucide-react';

interface DomainsOverviewProps {
  onSelectDomain: (domainId: DomainId) => void;
}

export const DomainsOverview: React.FC<DomainsOverviewProps> = ({ onSelectDomain }) => {
  const totalCount = PROJECTS.length;
  const totalExisting = PROJECTS.filter((p) => p.stage === 'existing').length;
  const totalPlanned = PROJECTS.filter((p) => p.stage === 'planned').length;

  return (
    <div className="mb-10">
      {/* Domains Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-hub-gold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>SIX RESEARCH DOMAINS</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-100">
            六大研究领域体系
          </h3>
        </div>
        <p className="text-xs text-slate-400 font-sans">
          共 {totalCount} 个模块（{totalExisting} 个已有入口 · {totalPlanned} 个规划方向）
        </p>
      </div>

      {/* 3 Columns x 2 Rows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOMAINS.map((domain) => {
          // Dynamic calculation from PROJECTS
          const existingCount = PROJECTS.filter((p) => p.domainId === domain.id && p.stage === 'existing').length;
          const plannedCount = PROJECTS.filter((p) => p.domainId === domain.id && p.stage === 'planned').length;

          return (
            <div
              key={domain.id}
              onClick={() => onSelectDomain(domain.id)}
              className="group relative flex flex-col justify-between p-4 rounded-xl bg-hub-card hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/40 cursor-pointer transition-all duration-150 shadow-sm"
            >
              <div>
                {/* Domain Number & EnName */}
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-hub-gold font-bold text-sm tracking-wider">
                    {domain.number}
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider">
                    {domain.enName}
                  </span>
                </div>

                {/* Domain Title */}
                <h4 className="text-base font-bold text-slate-100 group-hover:text-hub-goldLight transition-colors mb-1.5">
                  {domain.name}
                </h4>

                {/* Core Question */}
                <div className="p-2 rounded bg-hub-bg/60 border border-hub-border/50 mb-2.5">
                  <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                    “{domain.question}”
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                  {domain.description}
                </p>

                {/* Representative Tools */}
                <div className="mb-3">
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
              <div className="pt-2.5 border-t border-hub-border/60 flex items-center justify-between text-xs">
                <div className="font-mono text-[11px] text-slate-400">
                  <span className="text-emerald-400">{existingCount} 个已有</span>
                  {plannedCount > 0 && (
                    <>
                      <span className="text-slate-600 mx-1">·</span>
                      <span className="text-slate-400">{plannedCount} 个规划</span>
                    </>
                  )}
                </div>

                <span className="text-xs font-medium text-hub-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  筛选该领域 <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
