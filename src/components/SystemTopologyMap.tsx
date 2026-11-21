import React, { useState } from 'react';
import { 
  Cpu, ExternalLink, Info, Sparkles, Activity, Layers, 
  ArrowRight, Zap, Radio, CheckCircle2 
} from 'lucide-react';
import { Project } from '../types';
import { PROJECTS } from '../data/projects';
import { prewarmUrl } from '../utils/prewarm';

interface SystemTopologyMapProps {
  onSelectProject: (project: Project) => void;
  onOpenProjectExternal: (project: Project) => void;
  onOpenToolchainBridge: () => void;
}

type FlowFilter = 'all' | 'playbook-a' | 'playbook-b' | 'playbook-c' | 'bridge';

interface TopologyNode {
  id: string;
  projectId: string;
  stageCol: 1 | 2 | 3 | 4;
  x: number;
  y: number;
  code: string;
  title: string;
  subtitle: string;
  domainTag: string;
  playbooks: FlowFilter[];
  contractIn: string;
  contractOut: string;
  sampleMetric: string;
}

interface TopologyEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  flow: 'playbook-a' | 'playbook-b' | 'playbook-c' | 'bridge';
}

const TOPOLOGY_NODES: TopologyNode[] = [
  // Stage 1: Data & Signal Extraction (x = 135)
  {
    id: 'listed-filing-textmine',
    projectId: 'listed-filing-textmine',
    stageCol: 1,
    x: 135,
    y: 108,
    code: 'SYS-02A',
    title: '年报文本特征引擎',
    subtitle: 'MD&A 语气切分 · DuckDB',
    domainTag: '02 公司与产业',
    playbooks: ['all', 'playbook-a', 'bridge'],
    contractIn: '上市公司 10-K / 年报 PDF 原始披露',
    contractOut: 'EF-CONTRACT-01: 净乐观度与风险词频 CSV',
    sampleMetric: 'Tone Optimism = +0.258 (2026Q1)',
  },
  {
    id: 'ef-lab',
    projectId: 'ef-lab',
    stageCol: 1,
    x: 135,
    y: 230,
    code: 'SYS-05A',
    title: 'EF Lab 理论与实验',
    subtitle: '资产定价 · 计量仿真基石',
    domainTag: '05 学术与学习',
    playbooks: ['all', 'playbook-b'],
    contractIn: '结构化经济学模型与先验参数分布',
    contractOut: '可证伪数理假说命题 (H1 / H2) 与曲面边界',
    sampleMetric: '3D 连续定价偏导与蒙特卡洛核验',
  },
  {
    id: 'market-pulse',
    projectId: 'market-pulse',
    stageCol: 1,
    x: 135,
    y: 352,
    code: 'SYS-01A',
    title: 'Market Pulse 终端',
    subtitle: '跨资产行情与高频宏观日历',
    domainTag: '01 市场与宏观',
    playbooks: ['all', 'playbook-c'],
    contractIn: '全球国债利差、大类资产高频报价序列',
    contractOut: '跨资产脉冲热力快照 (?ticker / ?series)',
    sampleMetric: 'US10Y / CN10Y 跨期利差实时监控',
  },

  // Stage 2: Structural & Causal Penetration (x = 395)
  {
    id: 'bank-alm-credit-lab',
    projectId: 'bank-alm-credit-lab',
    stageCol: 2,
    x: 395,
    y: 108,
    code: 'SYS-02B',
    title: '产业链利润池 / 银行ALM',
    subtitle: '重定价缺口 · Capex 周期位点',
    domainTag: '02 公司与产业',
    playbooks: ['all', 'playbook-a'],
    contractIn: '生息资产/付息负债期限表 & 上下游毛利矩阵',
    contractOut: 'NIM 净息差敏感性曲线 & 产能出清拐点',
    sampleMetric: '负债重定价节约 +9bp · NIM 企稳',
  },
  {
    id: 'causal-inference-replication-ground',
    projectId: 'causal-inference-replication-ground',
    stageCol: 2,
    x: 395,
    y: 230,
    code: 'SYS-05B',
    title: '因果识别与论文复现场',
    subtitle: '交错 DID · 断点回归 · 合成控制',
    domainTag: '05 学术与学习',
    playbooks: ['all', 'playbook-b'],
    contractIn: '外生冲击时间表、处理组与对照组面板数据',
    contractOut: '平行趋势动态系数与反事实因果净效应',
    sampleMetric: 'Callaway-Sant’Anna 异质性处理效应',
  },
  {
    id: 'quant-risk-lab',
    projectId: 'quant-risk-lab',
    stageCol: 2,
    x: 395,
    y: 352,
    code: 'SYS-01B',
    title: 'QuantRiskLab 时点风险',
    subtitle: 'Point-in-Time 无前视偏差计量',
    domainTag: '01 市场与宏观',
    playbooks: ['all', 'playbook-c'],
    contractIn: '特定历史截止日 (?as_of=YYYY-MM-DD) 宏观切片',
    contractOut: '等权方差贡献分解与局部投影脉冲响应',
    sampleMetric: 'as_of=2026-03-31 尾部风险穿透',
  },

  // Stage 3: Implied Valuation & Factor Attribution (x = 655)
  {
    id: 'company-valuation-implied-expectations',
    projectId: 'company-valuation-implied-expectations',
    stageCol: 3,
    x: 655,
    y: 108,
    code: 'SYS-02C',
    title: '逆向DCF与隐含预期',
    subtitle: '求根反推市场隐含增速 g*',
    domainTag: '02 公司与产业',
    playbooks: ['all', 'playbook-a'],
    contractIn: '当前总市值、WACC 折现率、自由现金流基准',
    contractOut: '市场隐含 FCF 增速 g* vs 基准增速安全边际',
    sampleMetric: '隐含 g*=3.2% vs 基准 5.8% (边际 +26.5%)',
  },
  {
    id: 'a-share-event-study',
    projectId: 'a-share-event-study',
    stageCol: 3,
    x: 655,
    y: 230,
    code: 'SYS-05C',
    title: 'A股事件研究 & 微观MML',
    subtitle: 'CAR 超额收益 · 逐笔订单流冲击',
    domainTag: '05 学术 / 04 微观',
    playbooks: ['all', 'playbook-b'],
    contractIn: 'EF-CONTRACT-02: 事件发生日清单 CSV & 逐笔流水',
    contractOut: '事件窗口 CAAR 路径图 & 学术 LaTeX 三线表',
    sampleMetric: '[-5,+20] 窗口 CAAR t-stat = 2.84***',
  },
  {
    id: 'factor-workbench',
    projectId: 'factor-workbench',
    stageCol: 3,
    x: 655,
    y: 352,
    code: 'SYS-03A',
    title: '单因子检验 · 因子工作台',
    subtitle: '行业市值中性化 · Rank IC / Brinson',
    domainTag: '03 策略与组合',
    playbooks: ['all', 'playbook-c', 'bridge'],
    contractIn: '截面因子暴露矩阵 CSV & 申万行业基准',
    contractOut: '十组多空净值、IC 衰减与风格风险归因报告',
    sampleMetric: 'Rank IC = 0.048 (t = 2.14) · 年化 +4.2%',
  },

  // Stage 4: Risk Budgeting & Ex-Ante Brier Audit (x = 915)
  {
    id: 'decision-probability-calibration',
    projectId: 'decision-probability-calibration',
    stageCol: 4,
    x: 915,
    y: 165,
    code: 'SYS-03B',
    title: '概率校准与认错红线',
    subtitle: '事前置信概率 p · Brier 记分审计',
    domainTag: '03 策略与组合',
    playbooks: ['all', 'playbook-a', 'playbook-b', 'playbook-c'],
    contractIn: '核心投资假说、事前主观胜率 p% 与硬性证伪指标',
    contractOut: '事后 Brier 误差得分 (p - o)² 与校准曲线归档',
    sampleMetric: 'p = 72% · Brier Score = 0.0784',
  },
  {
    id: 'portfolio-risk-budgeting',
    projectId: 'portfolio-risk-budgeting',
    stageCol: 4,
    x: 915,
    y: 315,
    code: 'SYS-03C',
    title: '组合决策与风险预算',
    subtitle: '层级风险平价 HRP · CVaR 约束',
    domainTag: '03 策略与组合',
    playbooks: ['all', 'playbook-c'],
    contractIn: 'EF-CONTRACT-04: 资产协方差矩阵与风险预算上限',
    contractOut: '等风险贡献 (ERC) 目标权重表与最大回撤配额',
    sampleMetric: 'MRC 边际风险均衡 · CVaR 95% 锁定',
  },
];

const TOPOLOGY_EDGES: TopologyEdge[] = [
  // Playbook A edges (Company Fundamental Flow)
  {
    id: 'edge-a1',
    from: 'listed-filing-textmine',
    to: 'bank-alm-credit-lab',
    label: 'MD&A 语气面板 CSV',
    flow: 'playbook-a',
  },
  {
    id: 'edge-a2',
    from: 'bank-alm-credit-lab',
    to: 'company-valuation-implied-expectations',
    label: 'NIM 弹性 & Capex 驱动',
    flow: 'playbook-a',
  },
  {
    id: 'edge-a3',
    from: 'company-valuation-implied-expectations',
    to: 'decision-probability-calibration',
    label: '隐含增速 g* 安全边际',
    flow: 'playbook-a',
  },

  // Playbook B edges (Academic Empirical Flow)
  {
    id: 'edge-b1',
    from: 'ef-lab',
    to: 'causal-inference-replication-ground',
    label: '理论假说 H1/H2',
    flow: 'playbook-b',
  },
  {
    id: 'edge-b2',
    from: 'causal-inference-replication-ground',
    to: 'a-share-event-study',
    label: '干净外生事件样本 CSV',
    flow: 'playbook-b',
  },
  {
    id: 'edge-b3',
    from: 'a-share-event-study',
    to: 'decision-probability-calibration',
    label: 'CAAR 显著性与稳健性',
    flow: 'playbook-b',
  },

  // Playbook C edges (Auditable Investment Flow)
  {
    id: 'edge-c1',
    from: 'market-pulse',
    to: 'quant-risk-lab',
    label: 'as_of 宏观行情切片',
    flow: 'playbook-c',
  },
  {
    id: 'edge-c2',
    from: 'quant-risk-lab',
    to: 'factor-workbench',
    label: '无前视方差风险暴露',
    flow: 'playbook-c',
  },
  {
    id: 'edge-c3',
    from: 'factor-workbench',
    to: 'portfolio-risk-budgeting',
    label: 'Alpha 因子协方差矩阵',
    flow: 'playbook-c',
  },
  {
    id: 'edge-c4',
    from: 'portfolio-risk-budgeting',
    to: 'decision-probability-calibration',
    label: '风险配额 ➔ Brier 记分',
    flow: 'playbook-c',
  },

  // Verified Cross-Domain Toolchain Bridge (TextMine -> Factor Workbench)
  {
    id: 'edge-bridge',
    from: 'listed-filing-textmine',
    to: 'factor-workbench',
    label: 'EF-CONTRACT-01: 文本乐观度因子直通桥',
    flow: 'bridge',
  },
];

export const SystemTopologyMap: React.FC<SystemTopologyMapProps> = ({
  onSelectProject,
  onOpenProjectExternal,
  onOpenToolchainBridge,
}) => {
  const [activeFlow, setActiveFlow] = useState<FlowFilter>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('company-valuation-implied-expectations');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const focusedNodeId = hoveredNodeId || selectedNodeId;
  const focusedNode = TOPOLOGY_NODES.find((n) => n.id === focusedNodeId) || TOPOLOGY_NODES[0];
  const focusedProject = PROJECTS.find((p) => p.id === focusedNode.projectId);

  const isEdgeHighlighted = (edge: TopologyEdge) => {
    if (hoveredNodeId) {
      return edge.from === hoveredNodeId || edge.to === hoveredNodeId;
    }
    if (activeFlow === 'all') return true;
    return edge.flow === activeFlow;
  };

  const isNodeHighlighted = (node: TopologyNode) => {
    if (hoveredNodeId) {
      if (node.id === hoveredNodeId) return true;
      return TOPOLOGY_EDGES.some(
        (e) => (e.from === hoveredNodeId && e.to === node.id) || (e.to === hoveredNodeId && e.from === node.id)
      );
    }
    if (activeFlow === 'all') return true;
    return node.playbooks.includes(activeFlow);
  };

  const getFlowStrokeColor = (flow: TopologyEdge['flow']) => {
    switch (flow) {
      case 'playbook-a':
        return '#dfb26c'; // Hub Gold
      case 'playbook-b':
        return '#38bdf8'; // Sky Cyan
      case 'playbook-c':
        return '#14b8a6'; // Hub Teal
      case 'bridge':
        return '#f59e0b'; // Amber Bridge
    }
  };

  // Compute smooth cubic bezier wire path between two nodes
  const buildEdgePath = (edge: TopologyEdge) => {
    const fromNode = TOPOLOGY_NODES.find((n) => n.id === edge.from);
    const toNode = TOPOLOGY_NODES.find((n) => n.id === edge.to);
    if (!fromNode || !toNode) return { d: '', midX: 0, midY: 0, x1: 0, y1: 0, x2: 0, y2: 0 };

    const nodeHalfW = 92;
    const isSameCol = fromNode.stageCol === toNode.stageCol;

    if (isSameCol) {
      // Vertical connection between Stage 4 nodes
      const x1 = fromNode.x;
      const y1 = fromNode.y > toNode.y ? fromNode.y - 34 : fromNode.y + 34;
      const x2 = toNode.x;
      const y2 = fromNode.y > toNode.y ? toNode.y + 34 : toNode.y - 34;
      return {
        d: `M ${x1} ${y1} L ${x2} ${y2}`,
        midX: x1 + 48,
        midY: (y1 + y2) / 2,
        x1,
        y1,
        x2,
        y2,
      };
    }

    const x1 = fromNode.x + nodeHalfW;
    const y1 = fromNode.y;
    const x2 = toNode.x - nodeHalfW;
    const y2 = toNode.y;
    const dx = Math.abs(x2 - x1) * 0.48;
    const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    return {
      d,
      midX: (x1 + x2) / 2,
      midY: (y1 + y2) / 2 - (edge.flow === 'bridge' ? 14 : 8),
      x1,
      y1,
      x2,
      y2,
    };
  };

  return (
    <div className="rounded-2xl bg-hub-card border border-hub-border shadow-subtle overflow-hidden mb-8 hairline-highlight">
      {/* Top Instrument Frame Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-hub-panel/90 border-b border-hub-border flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-2 py-0.5 rounded bg-hub-gold/15 border border-hub-gold/40 text-hub-gold font-mono text-[10px] font-bold tracking-wider uppercase">
            FIG 01 // TOPOLOGY
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>跨系统投研数据流与工具链拓扑图</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-800/40">
                26 实时在线节点 · 契约驱动
              </span>
            </h3>
          </div>
        </div>

        {/* Interactive Route Filter Selector */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <button
            onClick={() => setActiveFlow('all')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              activeFlow === 'all'
                ? 'bg-hub-card text-slate-100 border-hub-gold/60 font-bold shadow-xs'
                : 'bg-hub-bg/60 text-slate-400 border-hub-border hover:text-slate-200'
            }`}
          >
            全景总线 (All)
          </button>
          <button
            onClick={() => {
              setActiveFlow('playbook-a');
              setSelectedNodeId('company-valuation-implied-expectations');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeFlow === 'playbook-a'
                ? 'bg-hub-gold/15 text-hub-goldLight border-hub-gold font-bold'
                : 'bg-hub-bg/60 text-slate-400 border-hub-border hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#dfb26c]" />
            <span>路径 A · 公司估值</span>
          </button>
          <button
            onClick={() => {
              setActiveFlow('playbook-b');
              setSelectedNodeId('causal-inference-replication-ground');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeFlow === 'playbook-b'
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/60 font-bold'
                : 'bg-hub-bg/60 text-slate-400 border-hub-border hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            <span>路径 B · 因果实证</span>
          </button>
          <button
            onClick={() => {
              setActiveFlow('playbook-c');
              setSelectedNodeId('quant-risk-lab');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeFlow === 'playbook-c'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/60 font-bold'
                : 'bg-hub-bg/60 text-slate-400 border-hub-border hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#14b8a6]" />
            <span>路径 C · 风险决策</span>
          </button>
          <button
            onClick={() => {
              setActiveFlow('bridge');
              setSelectedNodeId('factor-workbench');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeFlow === 'bridge'
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/60 font-bold'
                : 'bg-hub-bg/60 text-slate-400 border-hub-border hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>文本➔因子直通桥</span>
          </button>
        </div>
      </div>

      {/* SVG Technical Drawing Bench */}
      <div className="relative w-full overflow-x-auto bg-hub-bg/75 bg-grid-pattern">
        <div className="min-w-[860px] w-full">
          <svg
            viewBox="0 0 1050 425"
            className="w-full h-auto block select-none"
            role="img"
            aria-label="Eugene Finance Cross-System Research Topology Schematic"
          >
            <defs>
              {/* Soft Instrument Drop Shadow for Solid Nodes */}
              <filter id="node-elevation" x="-12%" y="-12%" width="124%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
              </filter>
              {/* Active Node Outer Glow */}
              <filter id="node-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#dfb26c" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Precision Ruler Tick Marks along Top Rail */}
            <g className="opacity-35">
              <line x1="20" y1="18" x2="1030" y2="18" stroke="var(--hub-border-hover)" strokeWidth="1" />
              {Array.from({ length: 41 }).map((_, idx) => {
                const tx = 30 + idx * 25;
                const isMajor = idx % 4 === 0;
                return (
                  <g key={idx}>
                    <line
                      x1={tx}
                      y1="18"
                      x2={tx}
                      y2={isMajor ? '25' : '22'}
                      stroke="var(--hub-border-hover)"
                      strokeWidth={isMajor ? '1.2' : '0.8'}
                    />
                    {isMajor && (
                      <text
                        x={tx + 3}
                        y="14"
                        fill="#64748b"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {idx * 25}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Corner Instrument Screws / Crosshairs */}
            {[
              { cx: 16, cy: 16 },
              { cx: 1034, cy: 16 },
              { cx: 16, cy: 409 },
              { cx: 1034, cy: 409 },
            ].map((pt, i) => (
              <g key={i} className="opacity-50">
                <circle cx={pt.cx} cy={pt.cy} r="4.5" fill="var(--hub-panel)" stroke="var(--hub-border-hover)" strokeWidth="1.2" />
                <line x1={pt.cx - 2.5} y1={pt.cy} x2={pt.cx + 2.5} y2={pt.cy} stroke="var(--hub-gold)" strokeWidth="0.9" />
                <line x1={pt.cx} y1={pt.cy - 2.5} x2={pt.cx} y2={pt.cy + 2.5} stroke="var(--hub-gold)" strokeWidth="0.9" />
              </g>
            ))}

            {/* 4 Vertical Stage Zone Columns & Headers */}
            {[
              { col: 1, x: 135, code: 'STAGE 01 // INGESTION', label: '原始信号与理论建模' },
              { col: 2, x: 395, code: 'STAGE 02 // MECHANISM', label: '结构穿透与因果识别' },
              { col: 3, x: 655, code: 'STAGE 03 // PRICING & ALPHA', label: '隐含预期与因子归因' },
              { col: 4, x: 915, code: 'STAGE 04 // DECISION AUDIT', label: '风险预算与 Brier 校准' },
            ].map((st) => (
              <g key={st.col}>
                {/* Subtle Stage Column Track */}
                <rect
                  x={st.x - 98}
                  y="34"
                  width="196"
                  height="374"
                  rx="10"
                  fill="var(--hub-panel)"
                  fillOpacity="0.38"
                  stroke="var(--hub-border)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Stage Header Plate */}
                <rect
                  x={st.x - 90}
                  y="40"
                  width="180"
                  height="24"
                  rx="5"
                  fill="var(--hub-card)"
                  stroke="var(--hub-border)"
                  strokeWidth="1"
                />
                <text
                  x={st.x}
                  y="51"
                  textAnchor="middle"
                  fill="var(--hub-gold)"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  letterSpacing="0.06em"
                >
                  {st.code}
                </text>
                <text
                  x={st.x}
                  y="60"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="sans-serif"
                >
                  {st.label}
                </text>
              </g>
            ))}

            {/* Data Contract Signal Buses (Wires painted behind nodes in strict Painter's Order) */}
            {TOPOLOGY_EDGES.map((edge) => {
              const highlighted = isEdgeHighlighted(edge);
              const color = getFlowStrokeColor(edge.flow);
              const { d, midX, midY, x1, y1, x2, y2 } = buildEdgePath(edge);

              return (
                <g
                  key={edge.id}
                  className="transition-opacity duration-200"
                  style={{ opacity: highlighted ? 1 : 0.16 }}
                >
                  {/* Base Cable Housing */}
                  <path
                    d={d}
                    fill="none"
                    stroke={highlighted ? color : '#475569'}
                    strokeWidth={highlighted ? 2.4 : 1.3}
                    strokeOpacity={highlighted ? 0.35 : 0.4}
                  />

                  {/* Animated Signal Flow Line */}
                  {highlighted && (
                    <path
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={edge.flow === 'bridge' ? 2.2 : 1.8}
                      className="svg-signal-flow"
                    />
                  )}

                  {/* Terminal Port Dots at Both Ends (Lines resolve on ports) */}
                  <circle
                    cx={x1}
                    cy={y1}
                    r="3.2"
                    fill="var(--hub-bg)"
                    stroke={highlighted ? color : '#64748b'}
                    strokeWidth="1.6"
                  />
                  <circle
                    cx={x2}
                    cy={y2}
                    r="3.2"
                    fill={highlighted ? color : '#64748b'}
                  />

                  {/* Contract Pill Label on Wire Midpoint */}
                  {highlighted && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-58"
                        y="-9"
                        width="116"
                        height="16"
                        rx="4"
                        fill="var(--hub-bg)"
                        fillOpacity="0.92"
                        stroke={color}
                        strokeWidth="0.9"
                        strokeOpacity="0.7"
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fill={color}
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Solid Instrument Nodes */}
            {TOPOLOGY_NODES.map((node) => {
              const highlighted = isNodeHighlighted(node);
              const isSelected = focusedNodeId === node.id;
              const halfW = 88;
              const halfH = 33;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => {
                    setHoveredNodeId(node.id);
                    const proj = PROJECTS.find((p) => p.id === node.projectId);
                    if (proj?.officialUrl) prewarmUrl(proj.officialUrl);
                  }}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer transition-opacity duration-200"
                  style={{ opacity: highlighted ? 1 : 0.32 }}
                  filter={isSelected ? 'url(#node-gold-glow)' : 'url(#node-elevation)'}
                >
                  {/* 3D Extruded Bottom Bevel Plate */}
                  <rect
                    x={-halfW}
                    y={-halfH + 3}
                    width={halfW * 2}
                    height={halfH * 2}
                    rx="8"
                    fill="var(--hub-bg)"
                    stroke={isSelected ? 'var(--hub-gold)' : 'var(--hub-border-hover)'}
                    strokeWidth="1"
                  />

                  {/* Main Solid Face */}
                  <rect
                    x={-halfW}
                    y={-halfH}
                    width={halfW * 2}
                    height={halfH * 2}
                    rx="8"
                    fill="var(--hub-card)"
                    stroke={isSelected ? 'var(--hub-gold)' : highlighted ? 'var(--hub-border-hover)' : 'var(--hub-border)'}
                    strokeWidth={isSelected ? '1.8' : '1.2'}
                  />

                  {/* Top Accent Hairline Bar */}
                  <line
                    x1={-halfW + 8}
                    y1={-halfH + 1.5}
                    x2={halfW - 8}
                    y2={-halfH + 1.5}
                    stroke={isSelected ? 'var(--hub-gold)' : 'rgba(255,255,255,0.08)'}
                    strokeWidth="1.2"
                  />

                  {/* Top Row: Code + Live Status LED + Domain */}
                  <text
                    x={-halfW + 10}
                    y={-halfH + 14}
                    fill="var(--hub-gold)"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.code}
                  </text>

                  <text
                    x={halfW - 18}
                    y={-halfH + 14}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {node.domainTag}
                  </text>

                  {/* Live Green LED Dot */}
                  <circle
                    cx={halfW - 10}
                    cy={-halfH + 11}
                    r="2.8"
                    fill="#10b981"
                  />

                  {/* Divider Seam (Runs edge-to-edge on node face) */}
                  <line
                    x1={-halfW}
                    y1={-halfH + 20}
                    x2={halfW}
                    y2={-halfH + 20}
                    stroke="var(--hub-border)"
                    strokeWidth="0.9"
                  />

                  {/* Node Primary Title */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="var(--hub-text)"
                    fontSize="11.5"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    {node.title}
                  </text>

                  {/* Node Subtitle */}
                  <text
                    x="0"
                    y="19"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {node.subtitle}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Bottom Live Telemetry Readout Bar */}
      <div className="px-4 sm:px-6 py-3.5 bg-hub-panel border-t border-hub-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] font-bold text-hub-gold">
              [{focusedNode.code}] {focusedNode.title}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-[11px] flex-1 min-w-0">
            <div className="truncate">
              <span className="text-slate-400 font-mono">输入契约: </span>
              <span className="text-slate-200 font-medium">{focusedNode.contractIn}</span>
            </div>
            <div className="truncate">
              <span className="text-slate-400 font-mono">输出产物: </span>
              <span className="text-hub-tealLight font-medium">{focusedNode.contractOut}</span>
            </div>
            <div className="truncate">
              <span className="text-slate-400 font-mono">实测读数: </span>
              <span className="text-hub-gold font-mono font-semibold">{focusedNode.sampleMetric}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons for Focused Node */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenToolchainBridge}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-hub-card hover:bg-hub-cardHover border border-hub-gold/30 text-hub-gold text-[11px] font-medium transition-colors"
            title="运行年报文本 ➔ 因子工作台 4 步实证桥接演练"
          >
            <Sparkles className="w-3 h-3" />
            <span>工具链演练</span>
          </button>

          {focusedProject && (
            <>
              <button
                onClick={() => onSelectProject(focusedProject)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-hub-card hover:bg-hub-cardHover border border-hub-border text-slate-300 hover:text-white text-[11px] transition-colors"
              >
                <Info className="w-3 h-3" />
                <span>模块规格</span>
              </button>

              <button
                onClick={() => onOpenProjectExternal(focusedProject)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-bold text-[11px] transition-all shadow-xs"
              >
                <span>打开 {focusedProject.name}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
