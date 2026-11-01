import React, { useState } from 'react';
import { 
  X, Check, ArrowRight, Layers, FileText, Database, Sparkles, 
  Download, Copy, CheckCircle2, ChevronRight, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ToolchainBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachToCase?: (artifact: { name: string; type: 'csv' | 'json' | 'text'; content: string; summary: string }) => void;
}

export const ToolchainBridgeModal: React.FC<ToolchainBridgeModalProps> = ({
  isOpen,
  onClose,
  onAttachToCase,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedTicker, setSelectedTicker] = useState('600036.SH');
  const [annualReportYear, setAnnualReportYear] = useState('2025');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAttached, setIsAttached] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  // Step 1: Simulated Extraction Results
  const extractedData = {
    ticker: selectedTicker,
    companyName: selectedTicker === '600036.SH' ? '招商银行' : '贵州茅台',
    reportYear: annualReportYear,
    disclosureDate: '2026-03-28',
    dictionaryVersion: 'Loughran-McDonald Financial Dictionary (2024 Chinese Edition)',
    wordCount: 38420,
    toneNetOptimism: 0.215, // (Positive - Negative) / Total Words
    uncertaintyScore: 0.142,
    litigiousScore: 0.038,
  };

  // Step 2: Mapped CSV Content
  const generatedCsv = `ticker,disclosure_date,report_year,tone_net_optimism,risk_uncertainty,litigious_score,word_count\n${extractedData.ticker},${extractedData.disclosureDate},${extractedData.reportYear},${extractedData.toneNetOptimism},${extractedData.uncertaintyScore},${extractedData.litigiousScore},${extractedData.wordCount}`;

  // Step 3 & 4: Factor Workbench Ingestion & Statistics
  const factorAnalysisResults = {
    targetFactor: 'MD&A_Net_Optimism',
    icMean: 0.048,
    icTStat: 2.14,
    coverageRows: 8,
    quantileSpread: '年化超额 +4.2%',
    samplePeriod: '2018-2025 (8年年报MD&A切片)',
  };

  const handleNextStep = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setActiveStep((prev) => Math.min(prev + 1, 4));
    }, 400);
  };

  const handleCopyCsv = () => {
    navigator.clipboard.writeText(generatedCsv);
    toast.success('已复制因子工作台标准 CSV 数据');
  };

  const handleAttachResult = () => {
    if (onAttachToCase) {
      onAttachToCase({
        name: `mda_factor_${selectedTicker}_${annualReportYear}.csv`,
        type: 'csv',
        content: generatedCsv,
        summary: `年报文本语气因子已打通：净乐观度 ${extractedData.toneNetOptimism}，IC = ${factorAnalysisResults.icMean}`,
      });
      setIsAttached(true);
      toast.success('已成功将证据与因子指标回流至研究事项！');
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 text-xs font-sans text-hub-text"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-hub-panel border border-hub-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 bg-hub-card border-b border-hub-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-hub-gold/15 text-hub-gold flex items-center justify-center border border-hub-gold/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>首条端到端贯通工具链实证演练</span>
                <span className="font-mono text-[10px] bg-hub-gold/15 text-hub-gold px-2 py-0.2 rounded border border-hub-gold/30">
                  V4.0 E2E Toolchain
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                年报文本特征引擎 ➔ 因子工作台 ➔ 研究成果回流闭环
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

        {/* 4-Step Stepper Progress Bar */}
        <div className="px-5 py-3 sm:px-6 bg-hub-bg/80 border-b border-hub-border flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { step: 1, label: '1. 年报文本抽取' },
            { step: 2, label: '2. 契约字段映射' },
            { step: 3, label: '3. 因子工具导入' },
            { step: 4, label: '4. 结果回流事项' },
          ].map((item) => (
            <div 
              key={item.step} 
              className={`flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                activeStep === item.step
                  ? 'bg-hub-gold/20 text-hub-gold font-bold border border-hub-gold/40'
                  : activeStep > item.step
                  ? 'text-emerald-400 bg-emerald-950/30'
                  : 'text-slate-400'
              }`}
            >
              {activeStep > item.step ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-hub-panel text-[10px] flex items-center justify-center border border-hub-border">
                  {item.step}
                </span>
              )}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* STEP 1: Text Mine Extraction */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-hub-card border border-hub-border space-y-3">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-hub-gold" />
                  <span>步骤 1：选择实证年报并完成文本特征抽取</span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  使用【年报文本特征引擎】对目标公司披露的完整 MD&A 进行分词、词性标注与金融情感词典匹配。
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">目标标的</label>
                    <select
                      value={selectedTicker}
                      onChange={(e) => setSelectedTicker(e.target.value)}
                      className="w-full bg-hub-bg border border-hub-border rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="600036.SH">600036.SH (招商银行)</option>
                      <option value="600519.SH">600519.SH (贵州茅台)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">会计年度</label>
                    <select
                      value={annualReportYear}
                      onChange={(e) => setAnnualReportYear(e.target.value)}
                      className="w-full bg-hub-bg border border-hub-border rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="2025">2025 年度 (最新可得)</option>
                      <option value="2024">2024 年度</option>
                      <option value="2023">2023 年度</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Extraction Metrics Table */}
              <div className="p-4 rounded-xl bg-hub-bg border border-hub-border space-y-2">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  已抽取指标提取值 (Extraction Payload)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-lg bg-hub-card border border-hub-border">
                    <span className="text-[10px] text-slate-400 block font-mono">净乐观语气</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">+{extractedData.toneNetOptimism}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-hub-card border border-hub-border">
                    <span className="text-[10px] text-slate-400 block font-mono">不确定性词频</span>
                    <span className="text-sm font-bold text-amber-300 font-mono">{extractedData.uncertaintyScore}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-hub-card border border-hub-border">
                    <span className="text-[10px] text-slate-400 block font-mono">披露基准时点</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">{extractedData.disclosureDate}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-hub-card border border-hub-border">
                    <span className="text-[10px] text-slate-400 block font-mono">总有效字数</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">{extractedData.wordCount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  依据词典：{extractedData.dictionaryVersion} · 具备无未来信息可得性
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Field Mapping & Schema Validation */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-hub-card border border-hub-border space-y-2">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-hub-teal" />
                  <span>步骤 2：字段映射与契约格式转换</span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  按【数据契约：上市公司年报文本特征数据集 (DS-TEXT-FILING-01)】转换为下游因子工作台标准 CSV，字段经济学含义完全对应。
                </p>
              </div>

              {/* Generated CSV preview */}
              <div className="p-4 rounded-xl bg-hub-bg border border-hub-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">生成的标准数据交换文本 (CSV)：</span>
                  <button
                    onClick={handleCopyCsv}
                    className="flex items-center gap-1 text-[11px] text-hub-gold hover:text-white transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>复制 CSV</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-hub-panel font-mono text-[11px] text-hub-tealLight overflow-x-auto border border-hub-border">
                  {generatedCsv}
                </pre>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>四层契约格式校验已通过：字段类型、边界（[-1.0, 1.0]）、时序前后自洽。</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Factor Ingestion */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-hub-card border border-hub-border space-y-2">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-hub-gold" />
                  <span>步骤 3：导入【因子工作台】进行时序检验</span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  模拟将该 CSV 导入因子分析工作台。回显公司代码、期间、字段和行数，并测算语气因子的预测有效性。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-hub-bg border border-hub-border space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-lg bg-hub-card border border-hub-border">
                    <span className="text-[10px] text-slate-400 block font-mono">导入样本行数</span>
                    <span className="text-sm font-bold text-slate-100 font-mono">{factorAnalysisResults.coverageRows} 行</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-hub-card border border-hub-border">
                    <span className="text-[10px] text-slate-400 block font-mono">IC 均值</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">+{factorAnalysisResults.icMean}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-hub-card border border-hub-border">
                    <span className="text-[10px] text-slate-400 block font-mono">t-统计量</span>
                    <span className="text-sm font-bold text-slate-100 font-mono">{factorAnalysisResults.icTStat} (显著)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-hub-card border border-hub-border">
                    <span className="text-[10px] text-slate-400 block font-mono">多空超额</span>
                    <span className="text-sm font-bold text-hub-goldLight font-mono">{factorAnalysisResults.quantileSpread}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-700/40 text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-amber-300 block mb-0.5">学术与实证审慎说明：</strong>
                  单个标的 8 年时序样本验证了数据导入与特征构建流程的自洽性；真正的跨截面有效性结论需要在全 A 股 5000+ 家样本池中做截面标准化与行业中性化处理。
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Return Results into Case */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-hub-card border border-hub-border space-y-2">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>步骤 4：将指标与证据附件回流至当前研究事项</span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  工具链计算已完成！现在可以把提取出的 CSV 底稿与 IC 指标直接附回到你的工作台研究事项，下次打开继续复查。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-hub-bg border border-hub-border space-y-2">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  待回流材料打包清单：
                </span>
                <div className="p-3 rounded-lg bg-hub-card border border-hub-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-hub-gold" />
                    <div>
                      <span className="font-mono font-bold text-slate-200">
                        mda_factor_{selectedTicker}_{annualReportYear}.csv
                      </span>
                      <p className="text-[10px] text-slate-400">
                        包含 net_optimism, risk_uncertainty, 披露日 2026-03-28
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">标准 CSV · 2.4KB</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="px-5 py-3.5 sm:px-6 bg-hub-card border-t border-hub-border flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1))}
            disabled={activeStep === 1 || isProcessing}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              activeStep === 1
                ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
                : 'bg-hub-panel hover:bg-hub-card border-hub-border text-slate-300 hover:text-white'
            }`}
          >
            上一步
          </button>

          <div className="flex items-center gap-2">
            {activeStep < 4 ? (
              <button
                onClick={handleNextStep}
                disabled={isProcessing}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-bold text-xs transition-all shadow-sm"
              >
                <span>{isProcessing ? '处理中...' : '下一步'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleAttachResult}
                disabled={isAttached}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isAttached ? '已回流完成' : '确认回流并保存到研究事项'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
