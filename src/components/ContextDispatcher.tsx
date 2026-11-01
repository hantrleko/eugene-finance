import React, { useState } from 'react';
import { Send, ArrowUpRight, Sparkles, Layers, Sliders, ExternalLink } from 'lucide-react';
import { Project } from '../types';
import { PROJECTS } from '../data/projects';
import { prewarmUrl } from '../utils/prewarm';

interface ContextDispatcherProps {
  onRecordOpen: (projectId: string) => void;
}

export const ContextDispatcher: React.FC<ContextDispatcherProps> = ({ onRecordOpen }) => {
  const [paramValue, setParamValue] = useState('600036.SH');

  // Quick preset shortcuts
  const presets = [
    { label: '招商银行 (600036.SH)', value: '600036.SH', type: 'ticker' },
    { label: '贵州茅台 (600519.SH)', value: '600519.SH', type: 'ticker' },
    { label: '腾讯控股 (00700.HK)', value: '00700.HK', type: 'ticker' },
    { label: '时点切片 (2026-10-30)', value: '2026-10-30', type: 'date' },
    { label: '美债10Y (US10Y)', value: 'US10Y', type: 'macro' },
  ];

  // Eligible projects supporting queryProtocol
  const querySupportedProjects = PROJECTS.filter((p) => p.queryProtocol && p.officialUrl);

  const getTargetUrl = (project: Project, val: string) => {
    if (!project.officialUrl || !project.queryProtocol) return project.officialUrl || '';
    const qp = project.queryProtocol;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(val.trim());

    if (isDate && qp.dateParam) {
      return `${project.officialUrl}?${qp.dateParam}=${encodeURIComponent(val.trim())}`;
    }

    if (qp.tickerParam) {
      return `${project.officialUrl}?${qp.tickerParam}=${encodeURIComponent(val.trim())}`;
    }

    if (qp.macroParam) {
      return `${project.officialUrl}?${qp.macroParam}=${encodeURIComponent(val.trim())}`;
    }

    if (qp.pairParam) {
      // If single ticker, suggest typical AH pair or use as is
      const pairVal = val.includes(',') ? val : `${val},03968.HK`;
      return `${project.officialUrl}?${qp.pairParam}=${encodeURIComponent(pairVal)}`;
    }

    return project.officialUrl;
  };

  const handleDispatch = (project: Project) => {
    onRecordOpen(project.id);
    const targetUrl = getTargetUrl(project, paramValue);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDispatchAll = () => {
    querySupportedProjects.forEach((p) => {
      onRecordOpen(p.id);
      const targetUrl = getTargetUrl(p, paramValue);
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    });
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-hub-card via-hub-panel to-hub-card border border-hub-border/80 shadow-sm space-y-3.5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-hub-teal/15 text-hub-teal flex items-center justify-center border border-hub-teal/30">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>跨系统上下文参数直达</span>
              <span className="font-mono text-[10px] bg-hub-teal/10 text-hub-teal px-1.5 py-0.2 rounded border border-hub-teal/20">
                URL Query Protocol
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              输入股票代码或时点日期，免去逐个系统重复输入的繁琐，一键带着上下文唤醒子工具链。
            </p>
          </div>
        </div>

        {/* Dispatch All Button */}
        <button
          onClick={handleDispatchAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-teal/40 hover:border-hub-teal text-hub-tealLight text-xs font-medium transition-colors self-start sm:self-auto flex-shrink-0"
          title="同时在新标签页打开这 5 个分析工具"
        >
          <Sparkles className="w-3.5 h-3.5 text-hub-teal" />
          <span>流水线联合直达 (5个工具)</span>
        </button>
      </div>

      {/* Input & Presets Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={paramValue}
            onChange={(e) => setParamValue(e.target.value)}
            placeholder="输入股票代码 (如 600036.SH) 或 时点日期 (如 2026-10-30)..."
            className="w-full bg-hub-bg border border-hub-border rounded-lg px-3.5 py-2 text-xs font-mono text-hub-goldLight placeholder-slate-500 focus:outline-none focus:border-hub-gold/60"
          />
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400">预设：</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setParamValue(p.value)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors border ${
                paramValue === p.value
                  ? 'bg-hub-gold/20 text-hub-goldLight border-hub-gold/40'
                  : 'bg-hub-bg/60 text-slate-400 hover:text-slate-200 border-hub-border/60 hover:bg-hub-card'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Available Direct Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
        {querySupportedProjects.map((p) => {
          const targetUrl = getTargetUrl(p, paramValue);
          return (
            <button
              key={p.id}
              onMouseEnter={() => prewarmUrl(p.officialUrl)}
              onClick={() => handleDispatch(p)}
              className="p-2.5 rounded-xl bg-hub-panel hover:bg-hub-card border border-hub-border hover:border-hub-teal/50 transition-all text-left flex flex-col justify-between group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>{p.domainNumber} {p.domainName}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-hub-teal transition-colors" />
                </div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-hub-tealLight transition-colors truncate">
                  {p.name}
                </div>
              </div>
              
              <div className="text-[9px] font-mono text-slate-400 truncate mt-1 pt-1 border-t border-hub-border/50 group-hover:text-hub-gold">
                ?{p.queryProtocol?.tickerParam || p.queryProtocol?.dateParam || 'param'}={paramValue}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
