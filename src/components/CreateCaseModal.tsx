import React, { useState } from 'react';
import { X, Plus, BookOpen, Calendar, Tag, Target, ArrowRight } from 'lucide-react';
import { ContextTargetType } from '../types';
import { PLAYBOOKS } from '../data/playbooks';
import { VERIFIED_AH_PAIRS } from './ContextDispatcher';
import { useToast } from '../context/ToastContext';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (params: {
    title: string;
    question: string;
    targetType: ContextTargetType;
    targetIdentifier: string;
    targetName: string;
    asOfDate: string;
    playbookId: string;
  }) => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [targetType, setTargetType] = useState<ContextTargetType>('stock');
  const [targetIdentifier, setTargetIdentifier] = useState('600036.SH');
  const [targetName, setTargetName] = useState('招商银行');
  const [asOfDate, setAsOfDate] = useState('2026-03-31');
  const [playbookId, setPlaybookId] = useState('playbook-a');
  const toast = useToast();

  if (!isOpen) return null;

  // Preset templates
  const presets = [
    {
      title: '贵州茅台批价波动与经销商库存周期研判',
      question: '批价企稳是否代表渠道去库存已完成？直销比例提升对净利率的真实拉动是多少？',
      targetType: 'stock' as ContextTargetType,
      targetIdentifier: '600519.SH',
      targetName: '贵州茅台',
      asOfDate: '2026-03-31',
      playbookId: 'playbook-a',
    },
    {
      title: '中美利差倒挂收敛与离岸人民币资产负债对冲',
      question: '十年期美债利率见顶下，如何使用外汇远期与利率互换对冲跨国流动性收缩？',
      targetType: 'macro' as ContextTargetType,
      targetIdentifier: 'US10Y',
      targetName: '美国十年期国债利率',
      asOfDate: '2026-03-31',
      playbookId: 'playbook-c',
    },
    {
      title: '中国平安 A/H 溢价率极值均值回复套利',
      question: '在资产负债利率敏感度对称前提下，AH 溢价率超过 35% 时是否存在稳定套利边际？',
      targetType: 'pair' as ContextTargetType,
      targetIdentifier: '601318.SH,02318.HK',
      targetName: '中国平安 (A+H)',
      asOfDate: '2026-03-31',
      playbookId: 'playbook-b',
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setTitle(p.title);
    setQuestion(p.question);
    setTargetType(p.targetType);
    setTargetIdentifier(p.targetIdentifier);
    setTargetName(p.targetName);
    setAsOfDate(p.asOfDate);
    setPlaybookId(p.playbookId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('请输入研究事项名称');
      return;
    }
    if (!question.trim()) {
      toast.warning('请输入核心研究命题');
      return;
    }

    onCreate({
      title: title.trim(),
      question: question.trim(),
      targetType,
      targetIdentifier: targetIdentifier.trim(),
      targetName: targetName.trim() || targetIdentifier.trim(),
      asOfDate: asOfDate.trim(),
      playbookId,
    });

    toast.success(`已创建研究事项: ${title.trim()}`);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 text-xs font-sans text-hub-text"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-hub-panel border border-hub-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 bg-hub-card border-b border-hub-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-hub-gold/15 text-hub-gold flex items-center justify-center border border-hub-gold/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                新建研究事项 (New Research Case)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                确立一个具体的投资或行业问题，选择研究路径，带着上下文开启工具协同
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-hub-bg hover:bg-hub-cardHover border border-hub-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
              快速载入命题模板：
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-hub-card hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/40 text-[11px] text-slate-300 transition-colors"
                >
                  {p.targetName} · {p.title.split('与')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              研究事项名称 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：招商银行零售资产质量与净息差拐点研究"
              className="w-full bg-hub-bg border border-hub-border rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60"
              required
            />
          </div>

          {/* Core Question */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              核心研究命题 / 拟解决的具体问题 *
            </label>
            <textarea
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：增长是否需要持续追加大量资本？负债端重定价何时传导至净息差边际企稳？"
              className="w-full bg-hub-bg border border-hub-border rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60 resize-none"
              required
            />
          </div>

          {/* Target Type & Identifier Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                标的类别
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as ContextTargetType)}
                className="w-full bg-hub-bg border border-hub-border rounded-lg px-3 py-2 text-xs text-slate-200"
              >
                <option value="stock">股票 / ETF</option>
                <option value="macro">宏观 / 利率</option>
                <option value="pair">A+H 配对</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                标的代码 (Identifier)
              </label>
              <input
                type="text"
                value={targetIdentifier}
                onChange={(e) => setTargetIdentifier(e.target.value)}
                placeholder="600036.SH"
                className="w-full bg-hub-bg border border-hub-border rounded-lg px-3 py-2 text-xs font-mono text-hub-goldLight placeholder-slate-500 focus:outline-none focus:border-hub-gold/60"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                标的中文名
              </label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="招商银行"
                className="w-full bg-hub-bg border border-hub-border rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60"
              />
            </div>
          </div>

          {/* Date & Playbook Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                信息截止日 (As-Of Date)
              </label>
              <input
                type="text"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full bg-hub-bg border border-hub-border rounded-lg px-3 py-2 text-xs font-mono text-hub-tealLight placeholder-slate-500 focus:outline-none focus:border-hub-teal/60"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                采用的标准研究路径
              </label>
              <select
                value={playbookId}
                onChange={(e) => setPlaybookId(e.target.value)}
                className="w-full bg-hub-bg border border-hub-border rounded-lg px-3 py-2 text-xs text-slate-200"
              >
                {PLAYBOOKS.map((pb) => (
                  <option key={pb.id} value={pb.id}>
                    路径 {pb.letter} · {pb.title} ({pb.steps.length} 步)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-hub-card/60 border border-hub-border/60 text-[11px] text-slate-400">
            创建后将自动根据该路径加载分解步骤清单，并允许分步带入上下文调用对应工具、保存提取指标与证据文件。
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-hub-border/60 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border text-slate-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-bold transition-all shadow-sm"
            >
              <span>立即创建并开启研究</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
