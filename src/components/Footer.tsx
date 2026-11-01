import React from 'react';
import { ShieldCheck, Database, GitBranch, Heart, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-hub-border bg-hub-bg text-slate-400 py-12 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Brand Hierarchy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-hub-border/60">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded overflow-hidden border border-hub-gold/40 flex-shrink-0">
                <img src="./eugene-logo.jpg" alt="Eugene Finance" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-slate-100 text-sm tracking-wide">
                Eugene Finance
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              研究与决策工作台 (Research Hub)。从数据与方法出发，形成行业理解与投资判断。
            </p>
            <div className="pt-1">
              <span className="font-mono text-[10px] text-hub-gold bg-hub-gold/10 px-2 py-0.5 rounded border border-hub-gold/20">
                Version 4.0 · Research Workbench
              </span>
            </div>
          </div>

          {/* Architecture Col */}
          <div className="space-y-2">
            <span className="font-mono text-slate-300 text-xs font-semibold block uppercase tracking-wider">
              品牌层级架构
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-300">总品牌：</strong> Eugene Finance
              </li>
              <li>
                <strong className="text-slate-300">综合入口：</strong> 研究与决策工作台
              </li>
              <li>
                <strong className="text-slate-300">理论基石：</strong> EF Lab · 理论与交互实验
              </li>
              <li>
                <strong className="text-slate-300">专业子集：</strong> 26项规范化模块
              </li>
            </ul>
          </div>

          {/* Six Domains Col */}
          <div className="space-y-2">
            <span className="font-mono text-slate-300 text-xs font-semibold block uppercase tracking-wider">
              六大体系领域
            </span>
            <div className="grid grid-cols-2 gap-1 text-slate-400">
              <span>01 市场与宏观</span>
              <span>02 公司与产业</span>
              <span>03 策略与组合</span>
              <span>04 微观与衍生品</span>
              <span>05 学术与学习</span>
              <span>06 探索与创作</span>
            </div>
          </div>

          {/* Principles Col */}
          <div className="space-y-2">
            <span className="font-mono text-slate-300 text-xs font-semibold block uppercase tracking-wider">
              V4.0 研究工作台工程规范
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              以“研究事项”为核心推进单元，支持分步实操记录、上下文参数精准分发、端到端工具链数据回流与个人实证成果归档。
            </p>
          </div>

        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div className="flex items-center gap-4 flex-wrap">
            <span>© {new Date().getFullYear()} Eugene Finance. All rights reserved.</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>本机偏好存储 · 严守隐私边界</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-hub-gold" />
              <span>单事实目录驱动 (Registry v4.0)</span>
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-hub-panel hover:bg-hub-card border border-hub-border text-slate-300 hover:text-white transition-colors"
          >
            <span>返回顶部</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
};
