import React, { useState, useMemo } from 'react';
import { 
  Send, ArrowUpRight, Sparkles, Layers, Sliders, ExternalLink, 
  Calendar, Check, Copy, AlertCircle, Info, Tag, Layers2 
} from 'lucide-react';
import { Project, ContextTargetType } from '../types';
import { PROJECTS } from '../data/projects';
import { prewarmUrl } from '../utils/prewarm';
import { useToast } from '../context/ToastContext';

interface ContextDispatcherProps {
  onRecordOpen: (projectId: string) => void;
  // Optional pre-filled state when used inside a Research Case
  initialType?: ContextTargetType;
  initialIdentifier?: string;
  initialDate?: string;
}

// Verified real A+H Pair Dictionary
export const VERIFIED_AH_PAIRS = [
  { aCode: '600036.SH', hCode: '03968.HK', name: '招商银行', pairParam: '600036.SH,03968.HK' },
  { aCode: '601318.SH', hCode: '02318.HK', name: '中国平安', pairParam: '601318.SH,02318.HK' },
  { aCode: '601398.SH', hCode: '01398.HK', name: '工商银行', pairParam: '601398.SH,01398.HK' },
  { aCode: '600030.SH', hCode: '06030.HK', name: '中信证券', pairParam: '600030.SH,06030.HK' },
  { aCode: '601857.SH', hCode: '00857.HK', name: '中国石油', pairParam: '601857.SH,00857.HK' },
  { aCode: '002594.SZ', hCode: '01211.HK', name: '比亚迪', pairParam: '002594.SZ,01211.HK' },
];

export const ContextDispatcher: React.FC<ContextDispatcherProps> = ({
  onRecordOpen,
  initialType = 'stock',
  initialIdentifier = '600036.SH',
  initialDate = '2026-03-31',
}) => {
  const [targetType, setTargetType] = useState<ContextTargetType>(initialType);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [asOfDate, setAsOfDate] = useState(initialDate);
  const [copiedConditions, setCopiedConditions] = useState(false);
  const toast = useToast();

  // Stock Presets
  const stockPresets = [
    { label: '招商银行 (600036.SH)', id: '600036.SH' },
    { label: '贵州茅台 (600519.SH)', id: '600519.SH' },
    { label: '腾讯控股 (00700.HK)', id: '00700.HK' },
    { label: '沪深300ETF (510300.SH)', id: '510300.SH' },
  ];

  // Macro Presets
  const macroPresets = [
    { label: '美债10Y (US10Y)', id: 'US10Y' },
    { label: '中债10Y (CN10Y)', id: 'CN10Y' },
    { label: '美元指数 (DXY)', id: 'DXY' },
    { label: '银行间质押回购 (DR007)', id: 'DR007' },
  ];

  // Date Presets
  const datePresets = [
    { label: '2026-03-31 (一季报时点)', date: '2026-03-31' },
    { label: '2025-12-31 (年报基准)', date: '2025-12-31' },
    { label: '2025-06-30 (半年报时点)', date: '2025-06-30' },
  ];

  // Check AH Pair validity when in pair mode
  const currentPairMatch = useMemo(() => {
    if (targetType !== 'pair') return null;
    const clean = identifier.trim().toUpperCase();
    return VERIFIED_AH_PAIRS.find(
      (p) => p.aCode === clean || p.hCode === clean || p.pairParam === clean || p.name === clean
    );
  }, [targetType, identifier]);

  // Filter eligible tools based on targetType
  const eligibleProjects = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (!p.officialUrl) return false;
      const qp = p.queryProtocol;
      if (!qp) return false;

      if (targetType === 'stock') {
        return Boolean(qp.tickerParam);
      }
      if (targetType === 'macro') {
        return Boolean(qp.macroParam);
      }
      if (targetType === 'pair') {
        return Boolean(qp.pairParam);
      }
      return false;
    });
  }, [targetType]);

  // Build target URL strictly based on target type
  const buildTargetUrl = (project: Project): { url: string; hasDirectReceiver: boolean } => {
    if (!project.officialUrl || !project.queryProtocol) {
      return { url: project.officialUrl || '', hasDirectReceiver: false };
    }

    const qp = project.queryProtocol;
    const params = new URLSearchParams();

    if (targetType === 'stock' && qp.tickerParam) {
      params.set(qp.tickerParam, identifier.trim());
      if (asOfDate && qp.dateParam) {
        params.set(qp.dateParam, asOfDate.trim());
      }
    } else if (targetType === 'macro' && qp.macroParam) {
      params.set(qp.macroParam, identifier.trim());
      if (asOfDate && qp.dateParam) {
        params.set(qp.dateParam, asOfDate.trim());
      }
    } else if (targetType === 'pair' && qp.pairParam) {
      const pairString = currentPairMatch ? currentPairMatch.pairParam : identifier.trim();
      params.set(qp.pairParam, pairString);
      if (asOfDate && qp.dateParam) {
        params.set(qp.dateParam, asOfDate.trim());
      }
    }

    const queryString = params.toString();
    const finalUrl = queryString ? `${project.officialUrl}?${queryString}` : project.officialUrl;
    return {
      url: finalUrl,
      hasDirectReceiver: Boolean(qp.hasDirectReceiver),
    };
  };

  const handleCopyConditions = () => {
    const text = `【Eugene Finance 研究上下文】\n研究类型：${
      targetType === 'stock' ? '个股/ETF' : targetType === 'macro' ? '宏观/利率' : 'A+H配对'
    }\n目标标的：${identifier}\n信息基准日：${asOfDate}\n导出时点：${new Date().toISOString()}`;
    navigator.clipboard.writeText(text);
    setCopiedConditions(true);
    toast.success('已复制研究条件清单至剪贴板');
    setTimeout(() => setCopiedConditions(false), 2000);
  };

  const handleDispatch = (project: Project) => {
    onRecordOpen(project.id);
    const { url, hasDirectReceiver } = buildTargetUrl(project);
    window.open(url, '_blank', 'noopener,noreferrer');

    if (!hasDirectReceiver) {
      toast.info(`已为 ${project.name} 生成启动链接；若目标未自动回显，可粘贴剪贴板中的研究条件`);
    } else {
      toast.success(`已唤醒 ${project.name} 并自动注入研究上下文`);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-hub-card via-hub-panel to-hub-card border border-hub-border shadow-sm space-y-4 mb-8 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hub-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-hub-teal/15 text-hub-teal flex items-center justify-center border border-hub-teal/30 flex-shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">
                跨工具研究条件分发引擎 (Context Dispatcher V4.0)
              </h3>
              <span className="font-mono text-[10px] bg-hub-teal/15 text-hub-teal px-2 py-0.2 rounded border border-hub-teal/30">
                类型约束 · 真实对应
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              区分研究对象类型与独立截止日，精确匹配能够消费该条件的子系统，杜绝盲目拼接。
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyConditions}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border hover:border-hub-gold/40 text-slate-200 transition-colors self-start sm:self-auto flex-shrink-0 text-xs"
          title="复制当前研究条件文本"
        >
          {copiedConditions ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-hub-gold" />}
          <span>{copiedConditions ? '已复制研究条件' : '复制条件清单'}</span>
        </button>
      </div>

      {/* Target Type Selector Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-slate-400">研究对象类别：</span>
        <div className="inline-flex rounded-lg bg-hub-bg p-1 border border-hub-border">
          <button
            onClick={() => {
              setTargetType('stock');
              setIdentifier('600036.SH');
            }}
            className={`px-3 py-1 rounded text-xs transition-all ${
              targetType === 'stock'
                ? 'bg-hub-panel text-hub-gold font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            股票 / ETF 标的
          </button>
          <button
            onClick={() => {
              setTargetType('macro');
              setIdentifier('US10Y');
            }}
            className={`px-3 py-1 rounded text-xs transition-all ${
              targetType === 'macro'
                ? 'bg-hub-panel text-hub-gold font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            宏观 / 利率序列
          </button>
          <button
            onClick={() => {
              setTargetType('pair');
              setIdentifier('600036.SH,03968.HK');
            }}
            className={`px-3 py-1 rounded text-xs transition-all ${
              targetType === 'pair'
                ? 'bg-hub-panel text-hub-gold font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            A+H 配对交易
          </button>
        </div>
      </div>

      {/* Inputs Grid: Identifier + AsOfDate */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Identifier Input */}
        <div className="md:col-span-7 space-y-1.5">
          <label className="text-[11px] font-mono text-slate-300 block">
            {targetType === 'stock'
              ? '证券代码 (Ticker)'
              : targetType === 'macro'
              ? '宏观指标序列标识 (Macro Series ID)'
              : '核验 A+H 股票配对 (A+H Pair)'}
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={
              targetType === 'stock'
                ? '例如 600036.SH 或 00700.HK'
                : targetType === 'macro'
                ? '例如 US10Y 或 CN10Y'
                : '例如 600036.SH,03968.HK'
            }
            className="w-full bg-hub-bg border border-hub-border rounded-lg px-3.5 py-2 font-mono text-xs text-hub-goldLight placeholder-slate-500 focus:outline-none focus:border-hub-gold/60"
          />

          {/* Quick presets for identifier */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-slate-400 font-mono">快速填充：</span>
            {targetType === 'stock' &&
              stockPresets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setIdentifier(p.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                    identifier === p.id
                      ? 'bg-hub-gold/20 text-hub-goldLight border-hub-gold/40'
                      : 'bg-hub-bg/60 text-slate-400 hover:text-slate-200 border-hub-border/60 hover:bg-hub-card'
                  }`}
                >
                  {p.label}
                </button>
              ))}

            {targetType === 'macro' &&
              macroPresets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setIdentifier(p.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                    identifier === p.id
                      ? 'bg-hub-gold/20 text-hub-goldLight border-hub-gold/40'
                      : 'bg-hub-bg/60 text-slate-400 hover:text-slate-200 border-hub-border/60 hover:bg-hub-card'
                  }`}
                >
                  {p.label}
                </button>
              ))}

            {targetType === 'pair' &&
              VERIFIED_AH_PAIRS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setIdentifier(p.pairParam)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                    identifier === p.pairParam
                      ? 'bg-hub-gold/20 text-hub-goldLight border-hub-gold/40'
                      : 'bg-hub-bg/60 text-slate-400 hover:text-slate-200 border-hub-border/60 hover:bg-hub-card'
                  }`}
                >
                  {p.name} ({p.aCode}/{p.hCode})
                </button>
              ))}
          </div>

          {/* Pair validation warning if invalid */}
          {targetType === 'pair' && !currentPairMatch && !identifier.includes(',') && (
            <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-700/40 text-[11px] text-amber-300 flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>当前输入未匹配标准 A+H 字典，建议在下方预设中选择经核验的真实配对。</span>
            </div>
          )}
        </div>

        {/* As Of Date Input */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="text-[11px] font-mono text-slate-300 block">
            信息截止日 / 观测时间基准 (As-Of Date)
          </label>
          <div className="relative">
            <input
              type="text"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="w-full bg-hub-bg border border-hub-border rounded-lg pl-8 pr-3.5 py-2 font-mono text-xs text-hub-tealLight placeholder-slate-500 focus:outline-none focus:border-hub-teal/60"
            />
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-slate-400 font-mono">时点预设：</span>
            {datePresets.map((dp) => (
              <button
                key={dp.date}
                onClick={() => setAsOfDate(dp.date)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                  asOfDate === dp.date
                    ? 'bg-hub-teal/20 text-hub-tealLight border-hub-teal/40'
                    : 'bg-hub-bg/60 text-slate-400 hover:text-slate-200 border-hub-border/60 hover:bg-hub-card'
                }`}
              >
                {dp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Eligible Tools Header */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Layers2 className="w-3.5 h-3.5 text-hub-gold" />
            <span>
              已为您匹配能接受该类条件的子工具 ({eligibleProjects.length} 项)：
            </span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            已过滤不适用或无参数接收能力的工具
          </span>
        </div>

        {eligibleProjects.length === 0 ? (
          <div className="p-4 rounded-xl bg-hub-bg text-center text-slate-400 text-xs border border-hub-border">
            暂无工具支持此类参数直接带入
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {eligibleProjects.map((p) => {
              const { url, hasDirectReceiver } = buildTargetUrl(p);
              return (
                <div
                  key={p.id}
                  onMouseEnter={() => prewarmUrl(p.officialUrl)}
                  className="p-3 rounded-xl bg-hub-panel hover:bg-hub-card border border-hub-border hover:border-hub-teal/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>{p.domainNumber} {p.domainName}</span>
                      {hasDirectReceiver ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                          URL已接入
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                          带参唤醒
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-hub-tealLight transition-colors">
                      {p.name}
                    </h4>

                    <div className="text-[10px] font-mono text-slate-400 mt-1 truncate bg-hub-bg/60 px-2 py-0.5 rounded border border-hub-border/50">
                      {url.replace(/^https?:\/\/[^/]+/, '')}
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-hub-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-sans">
                      {hasDirectReceiver ? '打开直接渲染' : '点击打开＋复制参数'}
                    </span>
                    <button
                      onClick={() => handleDispatch(p)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-hub-teal hover:text-hub-tealLight transition-colors"
                    >
                      <span>进入工具</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
