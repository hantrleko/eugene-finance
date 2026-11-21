import React, { useState, useEffect } from 'react';
import { 
  X, Check, ExternalLink, ArrowRight, BookOpen, Layers, 
  Calendar, CheckCircle2, Circle, Edit3, Plus, Trash2, 
  FileText, Sparkles, AlertTriangle, ArrowUpRight, Copy, Save, Archive,
  Maximize2, Minimize2, ShieldAlert, ShieldCheck, ClipboardPaste, Table2, TrendingUp
} from 'lucide-react';
import { ResearchCase, Project, ResearchSettlement, ResearchPreMortem } from '../types';
import { PROJECTS } from '../data/projects';
import { useToast } from '../context/ToastContext';

interface ResearchCaseModalProps {
  researchCase: ResearchCase | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCase?: (caseId: string, partial: Partial<ResearchCase>) => void;
  onToggleStep: (caseId: string, stepNumber: number) => void;
  onUpdateStepNotes: (caseId: string, stepNumber: number, notes: string) => void;
  onAddStepArtifact: (caseId: string, stepNumber: number, artifact: { name: string; type: 'csv' | 'json' | 'text'; content: string; size?: string }) => void;
  onDeleteStepArtifact: (caseId: string, stepNumber: number, artifactId: string) => void;
  onConcludeAndArchive: (caseId: string, conclusion: string, limitations: string, settlement?: ResearchSettlement) => void;
  onOpenProjectExternal: (project: Project) => void;
  onOpenToolchainBridge?: () => void;
}

// Helper to parse CSV text into headers, rows, and numeric sparkline values
function parseCsvPreview(csvContent?: string) {
  if (!csvContent || !csvContent.trim()) return null;
  const lines = csvContent
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1, 10).map((line) => line.split(',').map((cell) => cell.trim()));

  // Find first numeric metric column (skip year/date/id column 0)
  let sparkColIdx = -1;
  let sparkValues: number[] = [];

  for (let col = 1; col < headers.length; col++) {
    const vals = rows.map((r) => Number(r[col])).filter((n) => !Number.isNaN(n));
    if (vals.length >= 2) {
      sparkColIdx = col;
      sparkValues = vals;
      break;
    }
  }

  return {
    headers,
    rows,
    sparkColName: sparkColIdx >= 0 ? headers[sparkColIdx] : null,
    sparkValues,
  };
}

export const ResearchCaseModal: React.FC<ResearchCaseModalProps> = ({
  researchCase,
  isOpen,
  onClose,
  onUpdateCase,
  onToggleStep,
  onUpdateStepNotes,
  onAddStepArtifact,
  onDeleteStepArtifact,
  onConcludeAndArchive,
  onOpenToolchainBridge,
}) => {
  const [conclusion, setConclusion] = useState(researchCase?.conclusion || '');
  const [limitations, setLimitations] = useState(researchCase?.limitations || '');
  const [addingArtifactStep, setAddingArtifactStep] = useState<number | null>(null);
  const [artifactName, setArtifactName] = useState('');
  const [artifactContent, setArtifactContent] = useState('');
  const [expandedArtifactId, setExpandedArtifactId] = useState<string | null>('art-cmb-tone-csv');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pre-Mortem & Brier Settlement state
  const [newKillConditionText, setNewKillConditionText] = useState('');
  const [settlementOutcome, setSettlementOutcome] = useState<1 | 0>(1);

  const toast = useToast();

  useEffect(() => {
    if (researchCase) {
      setConclusion(researchCase.conclusion || '');
      setLimitations(researchCase.limitations || '');
      if (researchCase.settlement) {
        setSettlementOutcome(researchCase.settlement.outcome);
      }
      // Auto-expand first artifact with content
      const firstArtWithContent = researchCase.steps
        .flatMap((s) => s.artifacts)
        .find((a) => Boolean(a.content));
      if (firstArtWithContent) {
        setExpandedArtifactId(firstArtWithContent.id);
      }
    }
  }, [researchCase?.id]);

  if (!isOpen || !researchCase) return null;

  const completedCount = researchCase.steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / researchCase.steps.length) * 100);

  const preMortem: ResearchPreMortem = researchCase.preMortem || {
    exAnteProbability: 65,
    reviewDeadline: '2026-12-31',
    killConditions: [],
  };

  const triggeredKills = preMortem.killConditions.filter((k) => k.triggered);
  const probDecimal = preMortem.exAnteProbability / 100;
  const liveBrierScore = Math.pow(probDecimal - settlementOutcome, 2);

  const updatePreMortem = (nextPm: ResearchPreMortem) => {
    if (onUpdateCase) {
      onUpdateCase(researchCase.id, { preMortem: nextPm });
    }
  };

  const handleToggleKillCondition = (kcId: string) => {
    const nextConditions = preMortem.killConditions.map((k) =>
      k.id === kcId ? { ...k, triggered: !k.triggered } : k
    );
    updatePreMortem({ ...preMortem, killConditions: nextConditions });
  };

  const handleAddKillCondition = () => {
    if (!newKillConditionText.trim()) return;
    const nextConditions = [
      ...preMortem.killConditions,
      {
        id: `kc-${Date.now().toString(36)}`,
        text: newKillConditionText.trim(),
        triggered: false,
      },
    ];
    updatePreMortem({ ...preMortem, killConditions: nextConditions });
    setNewKillConditionText('');
    toast.success('已添加事前硬性证伪红线');
  };

  const handleDeleteKillCondition = (kcId: string) => {
    const nextConditions = preMortem.killConditions.filter((k) => k.id !== kcId);
    updatePreMortem({ ...preMortem, killConditions: nextConditions });
  };

  // Helper to open tool with verified parameters
  const handleOpenToolWithContext = (toolId?: string) => {
    if (!toolId) return;
    const project = PROJECTS.find((p) => p.id === toolId);
    if (!project) return;

    if (!project.officialUrl) {
      toast.info(`${project.name} 为规划中或本地运行工具，可参考步骤说明操作`);
      return;
    }

    const qp = project.queryProtocol;
    const params = new URLSearchParams();

    if (qp) {
      if (researchCase.targetType === 'stock' && qp.tickerParam) {
        params.set(qp.tickerParam, researchCase.targetIdentifier);
        if (qp.dateParam && researchCase.asOfDate) params.set(qp.dateParam, researchCase.asOfDate);
      } else if (researchCase.targetType === 'macro' && qp.macroParam) {
        params.set(qp.macroParam, researchCase.targetIdentifier);
        if (qp.dateParam && researchCase.asOfDate) params.set(qp.dateParam, researchCase.asOfDate);
      } else if (researchCase.targetType === 'pair' && qp.pairParam) {
        params.set(qp.pairParam, researchCase.targetIdentifier);
        if (qp.dateParam && researchCase.asOfDate) params.set(qp.dateParam, researchCase.asOfDate);
      }
    }

    const queryString = params.toString();
    const finalUrl = queryString ? `${project.officialUrl}?${queryString}` : project.officialUrl;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');

    if (qp?.hasDirectReceiver) {
      toast.success(`已带着上下文 [${researchCase.targetIdentifier}] 打开 ${project.name}`);
    } else {
      toast.info(`已为 ${project.name} 生成启动链接，研究条件 [${researchCase.targetIdentifier}] 已复制`);
      navigator.clipboard.writeText(`${researchCase.targetIdentifier} @ ${researchCase.asOfDate}`);
    }
  };

  // Smart Clipboard Ingestor
  const handleSmartClipboardIngest = async (stepNumber: number) => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText || !clipText.trim()) {
        toast.warning('剪贴板为空，请先在子工具中复制 CSV 或指标数据');
        return;
      }
      const trimmed = clipText.trim();
      const isCsv = trimmed.includes(',') && trimmed.includes('\n');
      const isJson = trimmed.startsWith('{') || trimmed.startsWith('[');
      const ext = isCsv ? 'csv' : isJson ? 'json' : 'txt';
      const autoName = `${researchCase.targetIdentifier.toLowerCase().replace(/[^a-z0-9]/g, '_')}_step${stepNumber}.${ext}`;

      onAddStepArtifact(researchCase.id, stepNumber, {
        name: autoName,
        type: isCsv ? 'csv' : isJson ? 'json' : 'text',
        content: trimmed,
        size: `${Math.max(0.5, trimmed.length / 1024).toFixed(1)}KB`,
      });
      toast.success(`已从剪贴板智能识别并入库证据：${autoName}`);
    } catch {
      // Fallback if clipboard permission denied
      setAddingArtifactStep(stepNumber);
      toast.info('请在展开的输入框中直接粘贴 (Ctrl+V) 剪贴板数据');
    }
  };

  const handleSaveArtifact = (stepNumber: number) => {
    if (!artifactName.trim()) {
      toast.warning('请输入材料/证据文件名');
      return;
    }
    onAddStepArtifact(researchCase.id, stepNumber, {
      name: artifactName.trim(),
      type: 'csv',
      content: artifactContent.trim(),
      size: `${Math.max(0.5, artifactContent.length / 1024).toFixed(1)}KB`,
    });
    setAddingArtifactStep(null);
    setArtifactName('');
    setArtifactContent('');
    toast.success('已保存研究证据与结果附件');
  };

  const handleCopyFullMarkdown = () => {
    let md = `# ${researchCase.title}\n\n`;
    md += `**标的**：${researchCase.targetName} (${researchCase.targetIdentifier}) ｜ **基准日**：${researchCase.asOfDate} ｜ **事前置信概率**：${preMortem.exAnteProbability}%\n`;
    md += `**Brier 结算得分**：${liveBrierScore.toFixed(4)} (${settlementOutcome === 1 ? '命题证实' : '命题证伪'})\n\n`;
    md += `> **核心问题**：${researchCase.question}\n\n`;
    md += `## 一、 事前认错红线 (Kill Conditions)\n`;
    preMortem.killConditions.forEach((kc) => {
      md += `- [${kc.triggered ? 'x' : ' '}] ${kc.text}\n`;
    });
    md += `\n## 二、 分步实操记录\n`;
    researchCase.steps.forEach((st) => {
      md += `### 步骤 ${st.stepNumber}：${st.title} (${st.completed ? '已完成' : '进行中'})\n`;
      if (st.notes) md += `${st.notes}\n\n`;
    });
    md += `## 三、 核心结论\n${conclusion || '（待填写）'}\n`;
    navigator.clipboard.writeText(md);
    toast.success('已复制完整 Markdown 研究底稿至剪贴板');
  };

  const handleArchive = () => {
    if (!conclusion.trim()) {
      toast.warning('请在右侧填写核心研判结论后再结案归档');
      return;
    }
    const settlement: ResearchSettlement = {
      outcome: settlementOutcome,
      brierScore: Number(liveBrierScore.toFixed(4)),
      settledAt: new Date().toISOString().slice(0, 10),
    };
    onConcludeAndArchive(researchCase.id, conclusion.trim(), limitations.trim(), settlement);
    toast.success(`已结案归档！本次 Brier 校准得分为 ${liveBrierScore.toFixed(4)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Split-Pane Studio Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-6 z-50">
        <aside 
          className={`w-screen ${
            isFullscreen ? 'max-w-full' : 'max-w-6xl'
          } bg-hub-panel border-l border-hub-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-hub-text select-text text-xs font-sans transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Studio Header */}
          <div className="px-5 py-3.5 sm:px-6 bg-hub-card border-b border-hub-border flex items-start justify-between flex-shrink-0 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-hub-gold/15 text-hub-gold border border-hub-gold/30 font-bold">
                  CASE STUDIO V4.3 · 路径 {researchCase.playbookLetter}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-hub-bg text-slate-200 border border-hub-border font-semibold">
                  标的：{researchCase.targetName} ({researchCase.targetIdentifier})
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-hub-bg text-hub-tealLight border border-hub-border flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-hub-teal" />
                  <span>时点：{researchCase.asOfDate}</span>
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-hub-panel text-hub-gold border border-hub-border">
                  事前概率 p = {preMortem.exAnteProbability}%
                </span>
                {triggeredKills.length > 0 && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-600/50 font-bold flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    <span>已触发 {triggeredKills.length} 条认错止损红线</span>
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                {researchCase.title}
              </h2>
              <p className="text-xs text-hub-goldLight mt-0.5 font-serif italic line-clamp-1">
                “{researchCase.question}”
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleCopyFullMarkdown}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-hub-bg hover:bg-hub-cardHover border border-hub-border text-slate-300 hover:text-white text-[11px] transition-colors"
                title="复制完整 Markdown 研究底稿"
              >
                <Copy className="w-3.5 h-3.5 text-hub-gold" />
                <span>复制底稿 MD</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-hub-bg hover:bg-hub-cardHover border border-hub-border transition-colors"
                title={isFullscreen ? '退出全屏' : '展开全屏工作台'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-hub-bg hover:bg-hub-cardHover border border-hub-border transition-colors"
                title="关闭 (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress & Toolchain Bar */}
          <div className="px-5 py-2 sm:px-6 bg-hub-bg/80 border-b border-hub-border flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-300 text-[11px]">
                实操完成度：{completedCount} / {researchCase.steps.length} 步 ({progressPercent}%)
              </span>
              <div className="w-28 sm:w-40 h-1.5 rounded-full bg-hub-card overflow-hidden border border-hub-border">
                <div 
                  className="h-full bg-gradient-to-r from-hub-gold to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {onOpenToolchainBridge && (
              <button
                onClick={onOpenToolchainBridge}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-hub-card hover:bg-hub-cardHover text-hub-gold border border-hub-gold/30 text-[11px] transition-colors"
              >
                <Sparkles className="w-3 h-3 text-hub-gold" />
                <span>年报文本 ➔ 因子工作台贯通桥</span>
              </button>
            )}
          </div>

          {/* SPLIT-PANE WORKSPACE BODY */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ================================================= */}
              {/* LEFT PANE (7 Cols): STEP EXECUTION & CSV EVIDENCE */}
              {/* ================================================= */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono text-slate-200 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-hub-gold" />
                    <span>左栏：分步执行与内联数据证据轨 (Execution & Evidence Track)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    支持 CSV 证据原地展開表格与趋势线
                  </span>
                </div>

                {researchCase.steps.map((st) => {
                  const isAddingArtifact = addingArtifactStep === st.stepNumber;

                  return (
                    <div
                      key={st.stepNumber}
                      className={`p-4 rounded-xl border transition-all ${
                        st.completed
                          ? 'bg-hub-card/60 border-emerald-500/30'
                          : 'bg-hub-card border-hub-border hover:border-hub-borderHover'
                      }`}
                    >
                      {/* Step Header & Parameterized Launch */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onToggleStep(researchCase.id, st.stepNumber)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                            title={st.completed ? '点击取消完成标记' : '点击确认该步骤已完成'}
                          >
                            {st.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500 hover:text-hub-gold" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] text-hub-gold font-bold">
                                STEP 0{st.stepNumber}
                              </span>
                              <span className={`font-bold text-xs sm:text-sm ${st.completed ? 'text-slate-300' : 'text-slate-100'}`}>
                                {st.title}
                              </span>
                              {st.completed && st.completedAt && (
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40">
                                  ✓ {st.completedAt}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {st.purpose}
                            </p>
                          </div>
                        </div>

                        {st.toolId && (
                          <button
                            onClick={() => handleOpenToolWithContext(st.toolId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border hover:border-hub-teal/50 text-hub-tealLight text-xs font-medium transition-colors self-start sm:self-auto flex-shrink-0 shadow-xs"
                            title="带着当前标的与截止日打开对应工具"
                          >
                            <span>打开 {st.toolName}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-hub-teal" />
                          </button>
                        )}
                      </div>

                      {/* Step Scratchpad */}
                      <div className="mt-3 pt-2.5 border-t border-hub-border/50 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Edit3 className="w-3 h-3 text-hub-gold" />
                            <span>实操记录与定量切片：</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">实时持久化</span>
                        </div>
                        <textarea
                          rows={2}
                          value={st.notes}
                          onChange={(e) => onUpdateStepNotes(researchCase.id, st.stepNumber, e.target.value)}
                          placeholder="记录从子系统提取的核心参数、回归统计量或异常发现..."
                          className="w-full bg-hub-bg border border-hub-border rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60 resize-none font-mono leading-relaxed"
                        />
                      </div>

                      {/* Step Artifacts & Inline CSV Table Preview */}
                      <div className="mt-2.5 pt-2.5 border-t border-hub-border/40">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <span className="text-[10px] font-mono text-slate-400">
                            数据证据材料 ({st.artifacts.length})：
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSmartClipboardIngest(st.stepNumber)}
                              className="text-[11px] px-2 py-0.5 rounded bg-hub-panel hover:bg-hub-card border border-hub-border hover:border-hub-gold/40 text-hub-gold flex items-center gap-1 transition-colors"
                              title="自动读取剪贴板中的 CSV 或指标文本并生成证据附件"
                            >
                              <ClipboardPaste className="w-3 h-3" />
                              <span>剪贴板一键抓取</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingArtifactStep(isAddingArtifact ? null : st.stepNumber)}
                              className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>手动粘贴 CSV</span>
                            </button>
                          </div>
                        </div>

                        {st.artifacts.length > 0 && (
                          <div className="space-y-2 mb-2">
                            <div className="flex flex-wrap gap-2">
                              {st.artifacts.map((art) => {
                                const isExpanded = expandedArtifactId === art.id;
                                const hasPreview = Boolean(art.content);
                                return (
                                  <div
                                    key={art.id}
                                    className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 text-[11px] font-mono transition-colors ${
                                      isExpanded
                                        ? 'bg-hub-panel border-hub-gold/60 text-slate-100'
                                        : 'bg-hub-bg border-hub-border text-slate-300'
                                    }`}
                                  >
                                    <Table2 className="w-3.5 h-3.5 text-hub-teal" />
                                    <button
                                      type="button"
                                      onClick={() => setExpandedArtifactId(isExpanded ? null : art.id)}
                                      className="hover:text-hub-goldLight font-medium flex items-center gap-1"
                                    >
                                      <span>{art.name}</span>
                                      {hasPreview && (
                                        <span className="text-[10px] text-hub-gold underline ml-1">
                                          {isExpanded ? '收起表格' : '预览数据'}
                                        </span>
                                      )}
                                    </button>
                                    {art.size && <span className="text-slate-500 text-[10px]">({art.size})</span>}
                                    <button
                                      type="button"
                                      onClick={() => onDeleteStepArtifact(researchCase.id, st.stepNumber, art.id)}
                                      className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                                      title="删除附件"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Expanded Inline CSV Table & Sparkline View */}
                            {st.artifacts.map((art) => {
                              if (expandedArtifactId !== art.id || !art.content) return null;
                              const csvData = parseCsvPreview(art.content);

                              if (!csvData) {
                                return (
                                  <pre
                                    key={`${art.id}-raw`}
                                    className="p-3 rounded-lg bg-hub-bg border border-hub-border text-[11px] font-mono text-slate-300 overflow-x-auto"
                                  >
                                    {art.content}
                                  </pre>
                                );
                              }

                              // Build SVG sparkline path if numeric column available
                              const vals = csvData.sparkValues;
                              const minV = Math.min(...vals);
                              const maxV = Math.max(...vals);
                              const span = maxV - minV || 1;
                              const sparkPoints = vals
                                .map((v, i) => {
                                  const sx = 12 + (i / Math.max(1, vals.length - 1)) * 156;
                                  const sy = 26 - ((v - minV) / span) * 20;
                                  return `${sx.toFixed(1)},${sy.toFixed(1)}`;
                                })
                                .join(' ');

                              return (
                                <div
                                  key={`${art.id}-grid`}
                                  className="p-3 rounded-xl bg-hub-bg border border-hub-gold/30 space-y-2.5 animate-in fade-in duration-150"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-hub-border/60">
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="w-3.5 h-3.5 text-hub-gold" />
                                      <span className="font-mono text-[11px] font-bold text-slate-200">
                                        {art.name} · 内联结构化切片 ({csvData.rows.length} 行)
                                      </span>
                                    </div>

                                    {csvData.sparkColName && vals.length >= 2 && (
                                      <div className="flex items-center gap-2 bg-hub-panel px-2.5 py-1 rounded-lg border border-hub-border">
                                        <span className="text-[10px] font-mono text-slate-400">
                                          {csvData.sparkColName} 趋势:
                                        </span>
                                        <svg width="180" height="32" className="overflow-visible">
                                          <polyline
                                            fill="none"
                                            stroke="#dfb26c"
                                            strokeWidth="1.8"
                                            points={sparkPoints}
                                          />
                                          {vals.map((v, i) => {
                                            const sx = 12 + (i / Math.max(1, vals.length - 1)) * 156;
                                            const sy = 26 - ((v - minV) / span) * 20;
                                            return (
                                              <circle
                                                key={i}
                                                cx={sx}
                                                cy={sy}
                                                r="2.4"
                                                fill={i === vals.length - 1 ? '#10b981' : '#dfb26c'}
                                              />
                                            );
                                          })}
                                        </svg>
                                        <span className="font-mono text-[10px] font-bold text-emerald-400">
                                          {vals[vals.length - 1]}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse font-mono text-[11px]">
                                      <thead>
                                        <tr className="border-b border-hub-border text-slate-400 bg-hub-panel/50">
                                          {csvData.headers.map((h, i) => (
                                            <th key={i} className="py-1.5 px-2.5 font-semibold">
                                              {h}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-hub-border/40">
                                        {csvData.rows.map((row, rIdx) => (
                                          <tr key={rIdx} className="hover:bg-hub-panel/40">
                                            {row.map((cell, cIdx) => (
                                              <td
                                                key={cIdx}
                                                className={`py-1.5 px-2.5 ${
                                                  cIdx === 0 ? 'font-bold text-hub-goldLight' : 'text-slate-200'
                                                }`}
                                              >
                                                {cell}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Manual Add CSV Form */}
                        {isAddingArtifact && (
                          <div className="p-3 rounded-lg bg-hub-bg border border-hub-border space-y-2 animate-in fade-in duration-150">
                            <input
                              type="text"
                              value={artifactName}
                              onChange={(e) => setArtifactName(e.target.value)}
                              placeholder="证据文件名，如 factor_ic_panel.csv"
                              className="w-full bg-hub-panel border border-hub-border rounded px-2.5 py-1.5 text-xs text-slate-200"
                            />
                            <textarea
                              rows={3}
                              value={artifactContent}
                              onChange={(e) => setArtifactContent(e.target.value)}
                              placeholder="粘贴带表头的 CSV 数据（如 year,metric_a,metric_b）或结果文本..."
                              className="w-full bg-hub-panel border border-hub-border rounded px-2.5 py-1.5 text-xs font-mono text-slate-300 resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setAddingArtifactStep(null)}
                                className="px-2.5 py-1 rounded bg-hub-panel text-[11px] text-slate-400"
                              >
                                取消
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveArtifact(st.stepNumber)}
                                className="px-3 py-1 rounded bg-hub-gold text-slate-950 font-bold text-[11px]"
                              >
                                保存并渲染表格
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ================================================= */}
              {/* RIGHT PANE (5 Cols): PRE-MORTEM, BRIER & MEMO     */}
              {/* ================================================= */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* CARD 1: PRE-MORTEM & KILL CONDITIONS LOCK */}
                <div
                  className={`p-4 rounded-xl border space-y-3.5 transition-all ${
                    triggeredKills.length > 0
                      ? 'bg-rose-950/20 border-rose-500/60'
                      : 'bg-hub-card border-hub-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono text-slate-100 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-hub-gold" />
                      <span>右栏 01：事前置信度与硬性认错线 (Pre-Mortem)</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-hub-panel text-hub-gold border border-hub-border">
                      反后见之明锁定
                    </span>
                  </div>

                  {/* Ex-Ante Probability Slider & Review Deadline */}
                  <div className="p-3 rounded-xl bg-hub-bg/80 border border-hub-border space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-300 font-medium">
                        事前主观胜率赋值 ($p$)：
                      </span>
                      <span className="text-sm font-mono font-bold text-hub-gold">
                        {preMortem.exAnteProbability}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      step={1}
                      value={preMortem.exAnteProbability}
                      onChange={(e) =>
                        updatePreMortem({ ...preMortem, exAnteProbability: Number(e.target.value) })
                      }
                      className="w-full accent-[#dfb26c] cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-hub-border/50">
                      <span>到期复盘核验日：</span>
                      <input
                        type="date"
                        value={preMortem.reviewDeadline}
                        onChange={(e) =>
                          updatePreMortem({ ...preMortem, reviewDeadline: e.target.value })
                        }
                        className="bg-hub-panel border border-hub-border rounded px-2 py-0.5 text-slate-200 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Hard Kill Conditions Checklist */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="font-semibold">
                        硬性证伪条件 (勾选即触发认错预警)：
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        已触发 {triggeredKills.length}/{preMortem.killConditions.length}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {preMortem.killConditions.map((kc) => (
                        <div
                          key={kc.id}
                          className={`p-2.5 rounded-lg border flex items-start justify-between gap-2 transition-colors ${
                            kc.triggered
                              ? 'bg-rose-950/50 border-rose-600/60 text-rose-200'
                              : 'bg-hub-bg/70 border-hub-border text-slate-200'
                          }`}
                        >
                          <label className="flex items-start gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={kc.triggered}
                              onChange={() => handleToggleKillCondition(kc.id)}
                              className="mt-0.5 accent-rose-500"
                            />
                            <span className={`text-[11px] leading-snug ${kc.triggered ? 'font-bold text-rose-300' : ''}`}>
                              {kc.text}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleDeleteKillCondition(kc.id)}
                            className="text-slate-500 hover:text-rose-400 p-0.5"
                            title="移除此条红线"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Kill Condition Input */}
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        value={newKillConditionText}
                        onChange={(e) => setNewKillConditionText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddKillCondition()}
                        placeholder="新增认错红线，如：连续两季核心毛利率跌破 22%..."
                        className="flex-1 bg-hub-bg border border-hub-border rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60"
                      />
                      <button
                        type="button"
                        onClick={handleAddKillCondition}
                        className="px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-cardHover border border-hub-border text-hub-gold font-semibold text-[11px] flex-shrink-0"
                      >
                        + 锁定
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD 2: BRIER SCORE SETTLEMENT CALCULATOR */}
                <div className="p-4 rounded-xl bg-hub-card border border-hub-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono text-slate-100 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>右栏 02：Brier 概率校准与结案对账</span>
                    </h3>
                    <span className="font-mono text-[10px] text-slate-400">
                      Brier = (p - o)²
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSettlementOutcome(1)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        settlementOutcome === 1
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold'
                          : 'bg-hub-bg border-hub-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-[10px] font-mono uppercase">Outcome = 1</div>
                      <div className="text-xs mt-0.5">命题证实 (达到预期)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettlementOutcome(0)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        settlementOutcome === 0
                          ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 font-bold'
                          : 'bg-hub-bg border-hub-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-[10px] font-mono uppercase">Outcome = 0</div>
                      <div className="text-xs mt-0.5">命题证伪 (触发认错)</div>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-hub-bg border border-hub-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        当前结算 Brier 误差得分 (越接近 0 越精准)：
                      </span>
                      <span className="text-base font-mono font-bold text-hub-gold">
                        {liveBrierScore.toFixed(4)}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${
                        liveBrierScore < 0.12
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50'
                          : liveBrierScore <= 0.25
                          ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
                          : 'bg-rose-950/60 text-rose-300 border-rose-700/50'
                      }`}
                    >
                      {liveBrierScore < 0.12
                        ? '卓越概率校准'
                        : liveBrierScore <= 0.25
                        ? '良好判断区间'
                        : '认知偏差显著'}
                    </span>
                  </div>
                </div>

                {/* CARD 3: SYNTHESIS MEMO & ARCHIVE */}
                <div className="p-4 rounded-xl bg-hub-card border border-hub-border space-y-3.5">
                  <h3 className="text-xs font-mono text-slate-100 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-hub-gold" />
                    <span>右栏 03：核心研判结论与底稿合成</span>
                  </h3>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-medium">
                      核心研判结论与非对称赔率逻辑 (Conclusion) *
                    </label>
                    <textarea
                      rows={4}
                      value={conclusion}
                      onChange={(e) => setConclusion(e.target.value)}
                      placeholder="整合左侧 5 步实证结果：市场隐含增速与我方基准的预期差来源、关键催化剂窗口及仓位建议..."
                      className="w-full bg-hub-bg border border-hub-border rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1 font-medium">
                      方法局限性与补充备忘 (Method Caveats)
                    </label>
                    <textarea
                      rows={2}
                      value={limitations}
                      onChange={(e) => setLimitations(e.target.value)}
                      placeholder="记录样本偏差、未覆盖的宏观尾部冲击或下期财报重点核验项..."
                      className="w-full bg-hub-bg border border-hub-border rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60 leading-relaxed font-mono"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Studio Footer */}
          <div className="px-5 py-3.5 sm:px-6 bg-hub-card border-t border-hub-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs flex-shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">
              双栏工作台实时保存至本地 · 支持随时导出 V4.3 全量快照
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-slate-300 border border-hub-border transition-colors"
              >
                保存进度并关闭
              </button>
              <button
                onClick={handleArchive}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-sm"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>结案计分并沉淀至研究记录库</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
