import React, { useState } from 'react';
import { 
  X, Check, ExternalLink, ArrowRight, BookOpen, Layers, 
  Calendar, CheckCircle2, Circle, Edit3, Plus, Trash2, 
  FileText, Sparkles, AlertTriangle, ArrowUpRight, Copy, Save, Archive 
} from 'lucide-react';
import { ResearchCase, Project } from '../types';
import { PROJECTS } from '../data/projects';
import { VERIFIED_AH_PAIRS } from './ContextDispatcher';
import { useToast } from '../context/ToastContext';

interface ResearchCaseModalProps {
  researchCase: ResearchCase | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStep: (caseId: string, stepNumber: number) => void;
  onUpdateStepNotes: (caseId: string, stepNumber: number, notes: string) => void;
  onAddStepArtifact: (caseId: string, stepNumber: number, artifact: { name: string; type: 'csv' | 'json' | 'text'; content: string; size?: string }) => void;
  onDeleteStepArtifact: (caseId: string, stepNumber: number, artifactId: string) => void;
  onConcludeAndArchive: (caseId: string, conclusion: string, limitations: string) => void;
  onOpenProjectExternal: (project: Project) => void;
  onOpenToolchainBridge?: () => void;
}

export const ResearchCaseModal: React.FC<ResearchCaseModalProps> = ({
  researchCase,
  isOpen,
  onClose,
  onToggleStep,
  onUpdateStepNotes,
  onAddStepArtifact,
  onDeleteStepArtifact,
  onConcludeAndArchive,
  onOpenProjectExternal,
  onOpenToolchainBridge,
}) => {
  const [conclusion, setConclusion] = useState(researchCase?.conclusion || '');
  const [limitations, setLimitations] = useState(researchCase?.limitations || '');
  const [addingArtifactStep, setAddingArtifactStep] = useState<number | null>(null);
  const [artifactName, setArtifactName] = useState('');
  const [artifactContent, setArtifactContent] = useState('');
  const toast = useToast();

  if (!isOpen || !researchCase) return null;

  const completedCount = researchCase.steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / researchCase.steps.length) * 100);

  // Helper to open tool with verified parameters
  const handleOpenToolWithContext = (toolId?: string) => {
    if (!toolId) return;
    const project = PROJECTS.find((p) => p.id === toolId);
    if (!project) return;

    if (!project.officialUrl) {
      toast.info(`${project.name} 为规划中或本地运行工具，可参考步骤说明操作`);
      return;
    }

    // Build verified URL
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

  const handleSaveArtifact = (stepNumber: number) => {
    if (!artifactName.trim()) {
      toast.warning('请输入材料/证据文件名');
      return;
    }
    onAddStepArtifact(researchCase.id, stepNumber, {
      name: artifactName.trim(),
      type: 'csv',
      content: artifactContent.trim(),
      size: `${(artifactContent.length / 1024).toFixed(1)}KB`,
    });
    setAddingArtifactStep(null);
    setArtifactName('');
    setArtifactContent('');
    toast.success('已保存研究证据与结果附件');
  };

  const handleArchive = () => {
    if (!conclusion.trim()) {
      toast.warning('请填写核心研判结论后再归档');
      return;
    }
    onConcludeAndArchive(researchCase.id, conclusion.trim(), limitations.trim());
    toast.success('已成功归档并沉淀为个人实证研究成果！');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 z-50">
        <aside 
          className="w-screen max-w-3xl bg-hub-panel border-l border-hub-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 text-hub-text select-text text-xs font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 bg-hub-card border-b border-hub-border flex items-start justify-between flex-shrink-0 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-hub-gold/15 text-hub-gold border border-hub-gold/30 font-bold">
                  路径 {researchCase.playbookLetter} · {researchCase.playbookTitle}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-hub-bg text-slate-300 border border-hub-border">
                  标的：{researchCase.targetName} ({researchCase.targetIdentifier})
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-hub-bg text-hub-tealLight border border-hub-border flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-hub-teal" />
                  <span>时点：{researchCase.asOfDate}</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  researchCase.status === 'concluded'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                    : 'bg-hub-gold/10 text-hub-gold border-hub-gold/20'
                }`}>
                  {researchCase.status === 'concluded' ? '已归档成果' : '在研推进中'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                {researchCase.title}
              </h2>
              <p className="text-xs text-hub-goldLight mt-1 font-serif italic">
                “{researchCase.question}”
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-hub-bg hover:bg-hub-cardHover border border-hub-border transition-colors flex-shrink-0"
              title="关闭 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar Strip */}
          <div className="px-5 py-2.5 sm:px-6 bg-hub-bg/70 border-b border-hub-border flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-300">
                推进进度：已实操完成 {completedCount} / {researchCase.steps.length} 步
              </span>
              <div className="w-28 sm:w-36 h-2 rounded-full bg-hub-card overflow-hidden border border-hub-border">
                <div 
                  className="h-full bg-gradient-to-r from-hub-gold to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {onOpenToolchainBridge && (
              <button
                onClick={onOpenToolchainBridge}
                className="flex items-center gap-1 px-2 py-1 rounded bg-hub-card hover:bg-hub-cardHover text-hub-gold border border-hub-gold/30 text-[11px] transition-colors"
                title="实证演示年报文本到因子工作台的端到端数据流动"
              >
                <Sparkles className="w-3 h-3 text-hub-gold" />
                <span>实证工具链演练</span>
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Step-by-Step Workbench Stream */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-hub-gold" />
                  <span>分步推进工作流 (Step Execution Flow)</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  打开工具不自动判定完成，需记录实操结果
                </span>
              </div>

              {researchCase.steps.map((st) => {
                const targetProject = PROJECTS.find((p) => p.id === st.toolId);
                const isAddingArtifact = addingArtifactStep === st.stepNumber;

                return (
                  <div
                    key={st.stepNumber}
                    className={`p-4 rounded-xl border transition-all ${
                      st.completed
                        ? 'bg-hub-card/50 border-emerald-500/30'
                        : 'bg-hub-card border-hub-border hover:border-hub-borderHover'
                    }`}
                  >
                    {/* Step Title & Actions */}
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
                              步骤 {st.stepNumber}
                            </span>
                            <span className={`font-semibold text-xs sm:text-sm ${st.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                              {st.title}
                            </span>
                            {st.completed && st.completedAt && (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40">
                                完成于 {st.completedAt}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {st.purpose}
                          </p>
                        </div>
                      </div>

                      {/* Tool Call Button */}
                      {st.toolId && (
                        <button
                          onClick={() => handleOpenToolWithContext(st.toolId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border hover:border-hub-teal/40 text-hub-tealLight text-xs transition-colors self-start sm:self-auto flex-shrink-0"
                          title="带着当前标的与截止日打开对应工具"
                        >
                          <span>{st.toolName}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-hub-teal" />
                        </button>
                      )}
                    </div>

                    {/* Step Notes / Scratchpad */}
                    <div className="mt-3 pt-3 border-t border-hub-border/50 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Edit3 className="w-3 h-3 text-hub-gold" />
                          <span>实操记录与提取数值：</span>
                        </span>
                        <span className="text-[10px] text-slate-500">自动保存</span>
                      </div>
                      <textarea
                        rows={2}
                        value={st.notes}
                        onChange={(e) => onUpdateStepNotes(researchCase.id, st.stepNumber, e.target.value)}
                        placeholder="在此记录本步骤从工具中提取的定量指标、核心判断依据或异常切片..."
                        className="w-full bg-hub-bg border border-hub-border rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60 resize-none font-mono leading-relaxed"
                      />
                    </div>

                    {/* Artifacts / Evidence attachments */}
                    <div className="mt-2 pt-2 border-t border-hub-border/40">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-slate-400">
                          已保存证据附件 ({st.artifacts.length})：
                        </span>
                        <button
                          onClick={() => setAddingArtifactStep(isAddingArtifact ? null : st.stepNumber)}
                          className="text-[11px] text-hub-gold hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>添加结果文件/CSV</span>
                        </button>
                      </div>

                      {st.artifacts.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {st.artifacts.map((art) => (
                            <div
                              key={art.id}
                              className="px-2.5 py-1 rounded bg-hub-bg border border-hub-border flex items-center gap-2 text-[11px] font-mono"
                            >
                              <FileText className="w-3.5 h-3.5 text-hub-teal" />
                              <span className="text-slate-300">{art.name}</span>
                              {art.size && <span className="text-slate-500 text-[10px]">({art.size})</span>}
                              <button
                                onClick={() => onDeleteStepArtifact(researchCase.id, st.stepNumber, art.id)}
                                className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                                title="删除附件"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Artifact Inline Form */}
                      {isAddingArtifact && (
                        <div className="p-3 rounded-lg bg-hub-bg border border-hub-border space-y-2 animate-in fade-in duration-150">
                          <input
                            type="text"
                            value={artifactName}
                            onChange={(e) => setArtifactName(e.target.value)}
                            placeholder="附件名称，如 cmb_mda_tone.csv"
                            className="w-full bg-hub-panel border border-hub-border rounded px-2.5 py-1.5 text-xs text-slate-200"
                          />
                          <textarea
                            rows={2}
                            value={artifactContent}
                            onChange={(e) => setArtifactContent(e.target.value)}
                            placeholder="粘贴 CSV 或结果指标文本内容..."
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
                              保存附件
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conclusion & Kill Conditions Block */}
            <div className="p-4 rounded-xl bg-hub-card border border-hub-border space-y-4">
              <h3 className="text-xs font-mono text-slate-200 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-hub-gold" />
                <span>综合研判与证伪认错线 (Synthesis & Kill Conditions)</span>
              </h3>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  核心研判结论 (Conclusion) *
                </label>
                <textarea
                  rows={3}
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  placeholder="整合各步骤工具结论：例如当前市值隐含增速与我方测算差值、安全边际、关键非共识驱动因素..."
                  className="w-full bg-hub-bg border border-hub-border rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  局限性与硬性证伪条件 (Limitations & Pre-Mortem)
                </label>
                <textarea
                  rows={2}
                  value={limitations}
                  onChange={(e) => setLimitations(e.target.value)}
                  placeholder="前置定义：样本局限性是什么？出现什么具体指标（如连续2季度NIM环比跌破1.85%）判定假说失效并主动认错止损？"
                  className="w-full bg-hub-bg border border-hub-border rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60 leading-relaxed font-mono"
                />
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 sm:px-6 bg-hub-card border-t border-hub-border flex items-center justify-between text-xs flex-shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">
              本地持久化存储 · 下次打开继续推进
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-slate-300 border border-hub-border transition-colors"
              >
                暂时保存并关闭
              </button>
              <button
                onClick={handleArchive}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-sm"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>一键沉淀为个人研究记录</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
