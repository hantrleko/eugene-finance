import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ArrowRight, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { Playbook, Project } from '../types';
import { PROJECTS } from '../data/projects';

interface PlaybookModalProps {
  playbook: Playbook | null;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onOpenProjectExternal: (project: Project) => void;
}

export const PlaybookModal: React.FC<PlaybookModalProps> = ({
  playbook,
  onClose,
  onSelectProject,
  onOpenProjectExternal,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'template'>('steps');

  if (!playbook) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(playbook.templateMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-hub-panel border border-hub-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-hub-border bg-hub-card flex items-start justify-between">
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

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-hub-cardHover border border-transparent hover:border-hub-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deliverable Callout Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-hub-gold/10 via-hub-teal/10 to-transparent border-b border-hub-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-hub-gold font-semibold uppercase">终点交付成果：</span>
            <span className="font-bold text-slate-100">{playbook.finalDeliverable}</span>
            <span className="text-slate-400 hidden md:inline">— {playbook.deliverableDescription}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('steps')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeTab === 'steps'
                  ? 'bg-hub-gold text-slate-900 font-medium'
                  : 'text-slate-300 hover:text-white bg-hub-bg/60 border border-hub-border'
              }`}
            >
              研究步骤指引
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                activeTab === 'template'
                  ? 'bg-hub-gold text-slate-900 font-medium'
                  : 'text-slate-300 hover:text-white bg-hub-bg/60 border border-hub-border'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>标准成果模板</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'steps' ? (
            <div className="space-y-6">
              
              {/* Note on first-edition boundary */}
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-hub-bg/70 border border-hub-border/60 text-xs text-slate-300 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-hub-gold flex-shrink-0 mt-0.5" />
                <p>
                  <strong>第一版工作台指引：</strong> 本路径是规范化步骤导航与任务说明。点击“进入工具”抵达对应子系统进行独立计算；规划中步骤提供严谨的任务指导，不设虚假一键按钮。
                </p>
              </div>

              {/* Step list */}
              <div className="space-y-4">
                {playbook.steps.map((step) => {
                  const project = step.projectId ? PROJECTS.find((p) => p.id === step.projectId) : undefined;
                  const isExisting = step.isExisting && project?.stage === 'existing';

                  return (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-xl bg-hub-card/80 border border-hub-border hover:border-hub-borderHover transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="w-6 h-6 rounded-full bg-hub-gold/20 text-hub-gold font-mono text-xs font-bold flex items-center justify-center border border-hub-gold/30">
                            {step.stepNumber}
                          </span>
                          <h4 className="text-sm font-bold text-slate-100">
                            {step.title}
                          </h4>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              isExisting
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {isExisting ? '已有工具 · 可直接运行' : '规划模块 · 任务指导'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mb-2">
                          <strong>核心目的：</strong> {step.purpose}
                        </p>

                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                          <strong>实操方法：</strong> {step.actionGuidance}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-hub-bg/60 p-2.5 rounded-lg border border-hub-border/50">
                          <div>
                            <span className="text-slate-400 block mb-0.5">需要输入准备：</span>
                            <span className="text-slate-300">{step.inputsRequired}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">本步预期成果：</span>
                            <span className="text-hub-goldLight">{step.expectedOutput}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tool Action Button */}
                      <div className="flex md:flex-col items-center justify-end gap-2 flex-shrink-0 pt-2 md:pt-0">
                        {project ? (
                          <>
                            <button
                              onClick={() => {
                                onSelectProject(project);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-xs text-slate-200 border border-hub-border hover:border-slate-500 transition-colors"
                            >
                              查看规格
                            </button>
                            {isExisting && (project.officialUrl || project.repoUrl) && (
                              <button
                                onClick={() => {
                                  onOpenProjectExternal(project);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-hub-teal/20 hover:bg-hub-teal/30 text-xs text-hub-tealLight hover:text-white border border-hub-teal/40 transition-colors flex items-center gap-1 font-medium"
                              >
                                <span>进入工具</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">
                            {step.toolName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            /* Standard Deliverable Markdown Template */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {playbook.finalDeliverable}
                  </h3>
                  <p className="text-xs text-slate-400">
                    可直接复制为 Markdown 文档作为你的研究底稿与投决归档。
                  </p>
                </div>

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
                      <span>一键复制 Markdown 模板</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-hub-card border border-hub-border font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
                  {playbook.templateMarkdown}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-hub-border bg-hub-card flex items-center justify-between text-xs font-mono text-slate-400">
          <span>完成本研究路径将沉淀完整证据包</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-hub-panel hover:bg-hub-card text-slate-300 hover:text-white border border-hub-border transition-colors"
          >
            关闭窗口
          </button>
        </div>

      </div>
    </div>
  );
};
