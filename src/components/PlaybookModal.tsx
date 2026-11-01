import React, { useState, useEffect } from 'react';
import { 
  X, Check, Copy, ExternalLink, ArrowRight, BookOpen, 
  AlertCircle, FileText, CheckCircle2, Circle, Download, 
  RotateCcw, Edit3 
} from 'lucide-react';
import { Playbook, Project } from '../types';
import { PROJECTS } from '../data/projects';
import { prewarmUrl } from '../utils/prewarm';

interface PlaybookModalProps {
  playbook: Playbook | null;
  onClose: () => void;
  onSelectProjectFromPlaybook: (project: Project, playbook: Playbook) => void;
  onOpenProjectExternal: (project: Project) => void;
}

interface ScratchpadData {
  completedSteps: number[];
  notes: Record<number, string>;
}

export const PlaybookModal: React.FC<PlaybookModalProps> = ({
  playbook,
  onClose,
  onSelectProjectFromPlaybook,
  onOpenProjectExternal,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'template'>('steps');
  const [includeNotes, setIncludeNotes] = useState(true);

  // Scratchpad state for this playbook
  const [scratchpad, setScratchpad] = useState<ScratchpadData>({
    completedSteps: [],
    notes: {},
  });

  // Load saved scratchpad whenever playbook changes
  useEffect(() => {
    if (!playbook) return;
    try {
      const saved = localStorage.getItem(`ef_pb_scratchpad_${playbook.id}`);
      if (saved) {
        setScratchpad(JSON.parse(saved));
      } else {
        setScratchpad({ completedSteps: [], notes: {} });
      }
    } catch {
      setScratchpad({ completedSteps: [], notes: {} });
    }
  }, [playbook]);

  // Esc key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!playbook) return null;

  const saveScratchpad = (newData: ScratchpadData) => {
    setScratchpad(newData);
    try {
      localStorage.setItem(`ef_pb_scratchpad_${playbook.id}`, JSON.stringify(newData));
    } catch {
      // ignore
    }
  };

  const toggleStepCompleted = (stepNumber: number) => {
    const isCompleted = scratchpad.completedSteps.includes(stepNumber);
    const updated = isCompleted
      ? scratchpad.completedSteps.filter((s) => s !== stepNumber)
      : [...scratchpad.completedSteps, stepNumber];
    saveScratchpad({ ...scratchpad, completedSteps: updated });
  };

  const updateStepNote = (stepNumber: number, note: string) => {
    const updatedNotes = { ...scratchpad.notes, [stepNumber]: note };
    saveScratchpad({ ...scratchpad, notes: updatedNotes });
  };

  const resetScratchpad = () => {
    if (window.confirm('确定要清空本条路径的勾选进度与笔记草稿吗？')) {
      const empty: ScratchpadData = { completedSteps: [], notes: {} };
      saveScratchpad(empty);
    }
  };

  // Generate full markdown with optional notes
  const generateExportMarkdown = () => {
    if (!includeNotes) return playbook.templateMarkdown;

    const hasAnyNotes = Object.values(scratchpad.notes).some((n) => n && n.trim().length > 0);
    const hasAnyCompleted = scratchpad.completedSteps.length > 0;

    if (!hasAnyNotes && !hasAnyCompleted) {
      return playbook.templateMarkdown;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    let appendix = `\n\n---\n\n## 附录：本路径实操执行记录与数据备忘 (${timestamp})\n`;
    appendix += `> 完成进度：已执行 ${scratchpad.completedSteps.length} / ${playbook.steps.length} 步\n\n`;

    playbook.steps.forEach((step) => {
      const isDone = scratchpad.completedSteps.includes(step.stepNumber);
      const note = scratchpad.notes[step.stepNumber]?.trim();
      appendix += `### 步骤 ${step.stepNumber}：${step.title} 【${isDone ? '已完成' : '未完成'}】\n`;
      appendix += `- **核心目的**：${step.purpose}\n`;
      appendix += `- **对应工具**：${step.toolName}\n`;
      if (note) {
        appendix += `- **实操记录与提取数值**：\n\n\`\`\`text\n${note}\n\`\`\`\n\n`;
      } else {
        appendix += `- **实操记录**：（无）\n\n`;
      }
    });

    return `${playbook.templateMarkdown}${appendix}`;
  };

  const handleCopy = () => {
    const textToCopy = generateExportMarkdown();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = generateExportMarkdown();
    const blob = new Blob([textToDownload], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playbook.id}-research-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const completedCount = scratchpad.completedSteps.length;
  const progressPercent = Math.round((completedCount / playbook.steps.length) * 100);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-hub-panel border border-hub-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-hub-border bg-hub-card flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-hub-gold/15 text-hub-gold border border-hub-gold/30 font-bold">
                路径 {playbook.letter}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                {playbook.enTitle}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              {playbook.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {playbook.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-hub-cardHover border border-transparent hover:border-hub-border transition-colors flex-shrink-0"
              title="关闭窗口 (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Deliverable Callout Banner with Interactive Tabs */}
        <div className="px-5 py-3 sm:px-6 bg-gradient-to-r from-hub-gold/10 via-hub-teal/10 to-transparent border-b border-hub-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-hub-gold font-semibold uppercase">终点成果：</span>
            <span className="font-bold text-slate-100">{playbook.finalDeliverable}</span>
            <div className="hidden md:flex items-center gap-1.5 ml-2 font-mono text-[11px] text-slate-400">
              <span>(进度: {completedCount}/{playbook.steps.length})</span>
              <div className="w-16 h-1.5 bg-hub-bg rounded-full overflow-hidden border border-hub-border inline-block">
                <div 
                  className="h-full bg-hub-teal transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('steps')}
              className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                activeTab === 'steps'
                  ? 'bg-hub-gold text-slate-900 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white bg-hub-bg/60 border border-hub-border'
              }`}
            >
              <span>研究步骤与实操笔记</span>
              {completedCount > 0 && (
                <span className="font-mono text-[10px] bg-slate-900/40 px-1 rounded">
                  {completedCount}/{playbook.steps.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                activeTab === 'template'
                  ? 'bg-hub-gold text-slate-900 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white bg-hub-bg/60 border border-hub-border'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>成果模板与导出</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {activeTab === 'steps' ? (
            <div className="space-y-5">
              
              {/* Note on first-edition boundary & Progress hint */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-hub-bg/70 border border-hub-border/60 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-hub-gold flex-shrink-0" />
                  <p>
                    勾选已完成步骤并随手记录关键数据，可在<strong>“成果模板与导出”</strong>中自动合成为完整研究底稿。
                  </p>
                </div>

                {(completedCount > 0 || Object.keys(scratchpad.notes).length > 0) && (
                  <button
                    onClick={resetScratchpad}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-rose-400 transition-colors ml-2 flex-shrink-0"
                    title="清空记录"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>重置草稿</span>
                  </button>
                )}
              </div>

              {/* Step list */}
              <div className="space-y-4">
                {playbook.steps.map((step) => {
                  const project = step.projectId ? PROJECTS.find((p) => p.id === step.projectId) : undefined;
                  const isExisting = step.isExisting && project?.stage === 'existing';
                  const isCompleted = scratchpad.completedSteps.includes(step.stepNumber);
                  const stepNote = scratchpad.notes[step.stepNumber] || '';

                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-hub-card/40 border-hub-teal/40'
                          : 'bg-hub-card/85 border-hub-border hover:border-hub-borderHover'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          
                          {/* Step number, checkbox and title */}
                          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                            <button
                              onClick={() => toggleStepCompleted(step.stepNumber)}
                              className={`flex items-center justify-center w-6 h-6 rounded-md border transition-colors ${
                                isCompleted
                                  ? 'bg-hub-teal text-white border-hub-teal'
                                  : 'bg-hub-panel hover:bg-hub-card text-slate-400 border-hub-border'
                              }`}
                              title={isCompleted ? '取消完成标记' : '标记此步骤为已完成'}
                            >
                              {isCompleted ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <span className="font-mono text-xs">{step.stepNumber}</span>
                              )}
                            </button>

                            <h4 className={`text-sm font-bold ${isCompleted ? 'text-hub-tealLight line-through opacity-85' : 'text-slate-100'}`}>
                              {step.title}
                            </h4>

                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                isExisting
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {isExisting ? '已有工具' : '规划模块'}
                            </span>

                            {isCompleted && (
                              <span className="text-[10px] font-mono text-hub-teal bg-hub-teal/15 px-2 py-0.5 rounded border border-hub-teal/30">
                                步骤已达成
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 mb-2">
                            <strong>核心目的：</strong> {step.purpose}
                          </p>

                          <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            <strong>实操方法：</strong> {step.actionGuidance}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-hub-bg/60 p-2.5 rounded-lg border border-hub-border/50 mb-3">
                            <div>
                              <span className="text-slate-400 block mb-0.5">需要输入准备：</span>
                              <span className="text-slate-300">{step.inputsRequired}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block mb-0.5">本步预期成果：</span>
                              <span className="text-hub-goldLight">{step.expectedOutput}</span>
                            </div>
                          </div>

                          {/* Scratchpad Note Area for this step */}
                          <div className="mt-2.5 pt-2.5 border-t border-hub-border/50">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-mono">
                              <Edit3 className="w-3 h-3 text-hub-gold" />
                              <span>本步实操底稿与数值记录 (本地自动保存)：</span>
                            </div>
                            <textarea
                              value={stepNote}
                              onChange={(e) => updateStepNote(step.stepNumber, e.target.value)}
                              placeholder={`记录步骤 ${step.stepNumber} 的观察、计算数值或非共识判断（如：逆向DCF隐含增速21%、安全边际15%）...`}
                              rows={2}
                              className="w-full text-xs font-mono bg-hub-panel/70 text-slate-200 border border-hub-border/70 rounded-lg p-2.5 placeholder-slate-500 focus:outline-none focus:border-hub-gold/50 transition-colors leading-relaxed"
                            />
                          </div>

                        </div>

                        {/* Tool Action Buttons */}
                        <div className="flex md:flex-col items-center justify-end gap-2 flex-shrink-0 pt-2 md:pt-0">
                          {project ? (
                            <>
                              {isExisting && project.officialUrl && (
                                <button
                                  onMouseEnter={() => prewarmUrl(project.officialUrl)}
                                  onClick={() => {
                                    onOpenProjectExternal(project);
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg bg-hub-teal/20 hover:bg-hub-teal/30 text-xs text-hub-tealLight hover:text-white border border-hub-teal/40 transition-colors flex items-center justify-center gap-1 font-medium"
                                >
                                  <span>打开应用</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  onSelectProjectFromPlaybook(project, playbook);
                                }}
                                className="w-full px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-xs text-slate-200 border border-hub-border hover:border-slate-500 transition-colors"
                              >
                                查看详情
                              </button>
                            </>
                          ) : (
                            <span className="text-xs font-mono text-slate-400">
                              {step.toolName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            /* Standard Deliverable Markdown Template + Scratchpad Synthesis */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-hub-card border border-hub-border">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {playbook.finalDeliverable}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    支持一键将实操记录与标准投决/研究结构合并导出为可复现 Markdown 文档。
                  </p>
                  
                  <label className="flex items-center gap-2 mt-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeNotes}
                      onChange={(e) => setIncludeNotes(e.target.checked)}
                      className="rounded border-hub-border text-hub-gold focus:ring-0 bg-hub-bg"
                    />
                    <span>在导出模板底部合并实操笔记与进度记录 ({completedCount}/{playbook.steps.length} 步已完成)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-slate-200 hover:text-white border border-hub-border text-xs transition-colors"
                    title="下载为 .md 文件"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载 .md</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-semibold text-xs transition-colors shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>已复制到剪贴板！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>复制 Markdown 底稿</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-hub-card border border-hub-border font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
                  {generateExportMarkdown()}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 sm:px-6 border-t border-hub-border bg-hub-card flex items-center justify-between text-xs font-mono text-slate-400">
          <span>完成本路径将输出标准化研究备忘</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-hub-panel hover:bg-hub-card text-slate-300 hover:text-white border border-hub-border transition-colors"
          >
            关闭 (Esc)
          </button>
        </div>

      </div>
    </div>
  );
};
