import React, { useState } from 'react';
import { Code, Copy, Check, ExternalLink, Terminal, Eye, Layers, Sparkles } from 'lucide-react';

export const MicroHeaderDemo: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState('quant-risk-lab');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sampleProjects = [
    { id: 'quant-risk-lab', name: 'QuantRiskLab', domain: '01 市场与宏观', nextName: 'GPR避险实验室', nextUrl: 'https://hantrleko.github.io/gpr-haven-lab/' },
    { id: 'listed-filing-textmine', name: '年报文本特征引擎', domain: '02 公司与产业', nextName: 'A股事件研究', nextUrl: 'https://a-share-event-study-production.up.railway.app' },
    { id: 'market-microstructure-lab', name: 'MML 市场微观结构', domain: '04 微观与衍生品', nextName: 'Market Pulse', nextUrl: 'https://market-pulse.replit.app' },
    { id: 'a-share-event-study', name: 'A股事件研究', domain: '05 学术与学习', nextName: '年报文本特征引擎', nextUrl: 'https://listed-filing-textmine-production.up.railway.app' },
  ];

  const current = sampleProjects.find((p) => p.id === selectedProjectId) || sampleProjects[0];

  const scriptTag = `<script src="https://hantrleko.github.io/eugene-finance/ef-nav.js" data-project="${current.id}"></script>`;

  const pythonStreamlitSnippet = `# Streamlit / Python 项目 1 行注入示例
import streamlit.components.v1 as components
components.html("""<script src="https://hantrleko.github.io/eugene-finance/ef-nav.js" data-project="${current.id}"></script>""", height=0)`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro callout */}
      <div className="p-4 rounded-xl bg-hub-card/80 border border-hub-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-hub-gold animate-pulse"></span>
            <span>统一跨项目导航条（Micro-Header · 28px Web Component）</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            极简无依赖脚本。采用 Shadow DOM 严格隔离宿主 CSS，在任何分散部署的子项目（GitHub Pages / Railway / Streamlit）顶部注入统一样式，提供工作台返回与下一站推荐。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://hantrleko.github.io/eugene-finance/ef-nav.js"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border text-xs text-slate-300 hover:text-white transition-colors"
          >
            <span>检查 ef-nav.js 源码</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Simulator Sandbox */}
      <div className="rounded-xl border border-hub-border overflow-hidden bg-slate-950 shadow-xl">
        <div className="px-4 py-2.5 bg-hub-card border-b border-hub-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="text-[11px] font-mono text-slate-400 ml-2">
              子系统视口实时仿真 (Simulated Host Project Viewport)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">切换测试宿主：</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-hub-panel border border-hub-border rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
            >
              {sampleProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.domain})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Bar Mock inside sandbox */}
        <div className="relative border-b border-hub-border bg-[#080c15] text-[11px] font-sans">
          {!isCollapsed ? (
            <div className="h-7 px-3 flex items-center justify-between text-slate-400 border-b border-hub-gold/30 bg-[#080c15]/95">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                  <span className="w-3.5 h-3.5 rounded bg-gradient-to-tr from-hub-gold to-amber-300 text-slate-950 text-[9px] font-extrabold flex items-center justify-center">
                    EF
                  </span>
                  <span>Eugene Finance</span>
                </div>
                <a 
                  href="#workbench"
                  className="text-slate-300 hover:text-white px-1.5 py-0.2 rounded bg-white/5 border border-white/10 hover:bg-hub-gold/20 text-[10px] transition-colors"
                >
                  ← 工作台
                </a>
                <span className="font-mono text-[9px] text-hub-gold bg-hub-gold/10 px-1 rounded border border-hub-gold/20">
                  {current.domain}
                </span>
                <span className="text-[10px] text-slate-500">· {current.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <a 
                  href={current.nextUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-hub-tealLight hover:underline text-[10px] flex items-center gap-1"
                >
                  <span>推荐下一站: {current.nextName}</span>
                  <span>→</span>
                </a>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-slate-500 hover:text-slate-300 p-0.5 text-[10px]"
                  title="折叠为极简角标"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2">
              <button
                onClick={() => setIsCollapsed(false)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-hub-card border border-hub-gold/40 text-[10px] text-hub-gold hover:text-white"
              >
                <span className="w-2.5 h-2.5 rounded bg-hub-gold text-slate-950 font-bold text-[8px] flex items-center justify-center">EF</span>
                <span>展开工作台导航 ▲</span>
              </button>
            </div>
          )}

          {/* Simulated App Content below the bar */}
          <div className="p-8 text-center bg-hub-panel/30 min-h-[140px] flex flex-col items-center justify-center">
            <h4 className="text-sm font-bold text-slate-300">
              这里是宿主应用界面：{current.name}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              顶部 28px 悬浮条常驻，无侵入式自动撑开 body 边距，用户随时可一键退回 Eugene Finance 主站工作台。
            </p>
          </div>
        </div>
      </div>

      {/* Copy-Paste Code Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* HTML / React / Vite */}
        <div className="p-4 rounded-xl bg-hub-card border border-hub-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-hub-gold" />
              <span>HTML / React / Vue 项目直接引入</span>
            </span>
            <button
              onClick={() => handleCopy(scriptTag)}
              className="text-xs font-mono text-hub-gold hover:text-white flex items-center gap-1"
            >
              {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedScript ? '已复制' : '复制标签'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-hub-bg font-mono text-[11px] text-hub-tealLight overflow-x-auto select-all border border-hub-border/50">
            {scriptTag}
          </pre>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            直接粘贴到子项目的 <code className="text-slate-300">index.html</code> 的 <code className="text-slate-300">&lt;head&gt;</code> 或 <code className="text-slate-300">&lt;body&gt;</code> 底部即可，自动完成视口适配。
          </p>
        </div>

        {/* Streamlit / Python */}
        <div className="p-4 rounded-xl bg-hub-card border border-hub-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-hub-teal" />
              <span>Python Streamlit 应用引入示例</span>
            </span>
            <button
              onClick={() => handleCopy(pythonStreamlitSnippet)}
              className="text-xs font-mono text-hub-gold hover:text-white flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>复制代码</span>
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-hub-bg font-mono text-[11px] text-slate-300 overflow-x-auto select-all border border-hub-border/50">
            {pythonStreamlitSnippet}
          </pre>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            针对 Railway / Streamlit 托管的应用，在主脚本入口加入以上一行，即可零成本完成全体系品牌贯通。
          </p>
        </div>

      </div>

    </div>
  );
};
