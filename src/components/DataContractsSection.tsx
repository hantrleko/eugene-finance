import React, { useState } from 'react';
import { 
  Database, FileCode, CheckCircle2, AlertTriangle, ArrowRight, 
  Download, Copy, Check, Sparkles, Sliders, RefreshCw, Layers, ShieldCheck 
} from 'lucide-react';
import { DATA_CONTRACTS, DataContract } from '../data/dataContracts';
import { MicroHeaderDemo } from './MicroHeaderDemo';
import { Project } from '../types';

interface DataContractsSectionProps {
  onSelectProject: (project: Project) => void;
}

export const DataContractsSection: React.FC<DataContractsSectionProps> = ({ onSelectProject }) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'validator' | 'microheader'>('contracts');
  const [selectedContractId, setSelectedContractId] = useState<string>(DATA_CONTRACTS[0].id);

  // Validator interactive state
  const [testContractId, setTestContractId] = useState<string>(DATA_CONTRACTS[0].id);
  const [inputCsv, setInputCsv] = useState<string>(DATA_CONTRACTS[0].sampleCsv);
  const [validationReport, setValidationReport] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    rowCount: number;
    errors: string[];
  }>({
    status: 'idle',
    message: '',
    rowCount: 0,
    errors: [],
  });
  const [copiedCsv, setCopiedCsv] = useState(false);

  const currentContract = DATA_CONTRACTS.find((c) => c.id === selectedContractId) || DATA_CONTRACTS[0];
  const activeTestContract = DATA_CONTRACTS.find((c) => c.id === testContractId) || DATA_CONTRACTS[0];

  // Run CSV Validation against selected schema
  const handleValidateCsv = () => {
    if (!inputCsv.trim()) {
      setValidationReport({
        status: 'error',
        message: '请输入或加载 CSV 内容',
        rowCount: 0,
        errors: ['内容为空'],
      });
      return;
    }

    const lines = inputCsv.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setValidationReport({
        status: 'error',
        message: 'CSV 至少需要包含 1 行表头和 1 行数据',
        rowCount: 0,
        errors: ['数据行数不足'],
      });
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const requiredFields = activeTestContract.fields.filter((f) => f.required).map((f) => f.name);
    const missingHeaders = requiredFields.filter((rf) => !headers.includes(rf));

    const errors: string[] = [];
    if (missingHeaders.length > 0) {
      errors.push(`缺失必要字段表头：${missingHeaders.join(', ')}`);
    }

    // Check rows data format
    const dataRows = lines.slice(1);
    dataRows.forEach((row, idx) => {
      const cols = row.split(',').map((c) => c.trim());
      if (cols.length !== headers.length) {
        errors.push(`第 ${idx + 2} 行列数与表头不一致（表头 ${headers.length} 列，该行 ${cols.length} 列）`);
      }
    });

    if (errors.length > 0) {
      setValidationReport({
        status: 'error',
        message: `校验未通过，发现 ${errors.length} 项格式违背`,
        rowCount: dataRows.length,
        errors,
      });
    } else {
      setValidationReport({
        status: 'success',
        message: `合规校验通过！${dataRows.length} 行数据完全符合 ${activeTestContract.code} 规范，可安全导入 ${activeTestContract.targetProjectNames.join('、')}。`,
        rowCount: dataRows.length,
        errors: [],
      });
    }
  };

  const handleDownloadSample = (contract: DataContract) => {
    const blob = new Blob([contract.sampleCsv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.code}-sample.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJsonSchema = (contract: DataContract) => {
    const text = JSON.stringify(contract.jsonSchema, null, 2);
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.code}-schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  return (
    <section id="contracts" className="py-10 border-b border-hub-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-hub-gold uppercase tracking-wider mb-1.5">
            <Database className="w-4 h-4" />
            <span>ECOSYSTEM ARCHITECTURE & DATA SCHEMAS (V3.0)</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
                <span>数据契约与跨项目转接中心</span>
                <span className="text-xs font-mono text-hub-teal bg-hub-teal/10 px-2 py-0.5 rounded border border-hub-teal/20 font-normal">
                  V3.0 轻量收敛
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                降低维护 20+ 个独立系统的工程负担，通过统一数据契约（Data Contracts）实现数据闭环，通过 28px 极简 Micro-Header 实现跨站品牌与导航融合。
              </p>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-hub-border/80 pb-3">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'contracts'
                ? 'bg-hub-gold text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white bg-hub-card border border-hub-border'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>5大统一数据交换契约</span>
          </button>

          <button
            onClick={() => setActiveTab('validator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'validator'
                ? 'bg-hub-gold text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white bg-hub-card border border-hub-border'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>数据转接与合规校验工作台</span>
          </button>

          <button
            onClick={() => setActiveTab('microheader')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'microheader'
                ? 'bg-hub-gold text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white bg-hub-card border border-hub-border'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>跨项目 Micro-Header 规范</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: 5 大统一数据交换契约 */}
        {/* ======================================================== */}
        {activeTab === 'contracts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
            
            {/* Left Column: Contract Selector List */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                数据契约列表：
              </span>
              {DATA_CONTRACTS.map((contract) => {
                const isSelected = selectedContractId === contract.id;
                return (
                  <div
                    key={contract.id}
                    onClick={() => setSelectedContractId(contract.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-hub-card border-hub-gold/50 shadow-sm'
                        : 'bg-hub-panel/60 hover:bg-hub-card/60 border-hub-border'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-hub-gold font-bold">{contract.code}</span>
                      <span className="text-slate-400">v{contract.version}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 mb-1 leading-snug">
                      {contract.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                      {contract.subtitle}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-hub-teal">
                      <span>来源: {contract.sourceProjectName}</span>
                      <span>➔</span>
                      <span>接收: {contract.targetProjectNames[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Detailed Specification & Schema */}
            <div className="lg:col-span-2 space-y-5">
              <div className="p-5 sm:p-6 rounded-2xl bg-hub-card border border-hub-border space-y-5">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-hub-border pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-hub-gold/15 text-hub-gold border border-hub-gold/30 font-bold">
                        {currentContract.code}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-hub-bg text-slate-300 border border-hub-border">
                        标准格式：.{currentContract.format.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        版本 {currentContract.version}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">
                      {currentContract.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {currentContract.purpose}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDownloadJsonSchema(currentContract)}
                      className="px-2.5 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                      title="下载 JSON Schema 定义文件"
                    >
                      <Download className="w-3.5 h-3.5 text-hub-teal" />
                      <span>下载 Schema</span>
                    </button>
                    <button
                      onClick={() => handleDownloadSample(currentContract)}
                      className="px-3 py-1.5 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                      title="下载标准示例 CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载示例 CSV</span>
                    </button>
                  </div>
                </div>

                {/* Pipeline Flow Indicator */}
                <div className="p-3 rounded-xl bg-hub-panel/80 border border-hub-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">源系统输出：</span>
                    <span className="font-semibold text-hub-goldLight">{currentContract.sourceProjectName}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-hub-teal" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">目标系统摄取：</span>
                    <span className="font-semibold text-hub-tealLight">{currentContract.targetProjectNames.join('、')}</span>
                  </div>
                </div>

                {/* Schema Fields Table */}
                <div>
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold">
                    字段规范说明表 (Field Specifications)
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-hub-border">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-hub-panel text-slate-300 border-b border-hub-border">
                        <tr>
                          <th className="p-2.5">字段名 (Column)</th>
                          <th className="p-2.5">数据类型</th>
                          <th className="p-2.5">必要性</th>
                          <th className="p-2.5">含义描述</th>
                          <th className="p-2.5">示例值</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hub-border/60 bg-hub-card">
                        {currentContract.fields.map((field) => (
                          <tr key={field.name} className="hover:bg-hub-panel/40">
                            <td className="p-2.5 font-bold text-hub-goldLight">{field.name}</td>
                            <td className="p-2.5 text-slate-400">{field.type}</td>
                            <td className="p-2.5">
                              {field.required ? (
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40">必填</span>
                              ) : (
                                <span className="text-[10px] text-slate-400">选填</span>
                              )}
                            </td>
                            <td className="p-2.5 font-sans text-slate-200">{field.description}</td>
                            <td className="p-2.5 text-slate-400 font-mono">{String(field.example)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sample CSV Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                      标准 CSV 数据切片预览
                    </h4>
                    <button
                      onClick={() => handleCopy(currentContract.sampleCsv)}
                      className="text-xs font-mono text-hub-gold hover:text-white flex items-center gap-1"
                    >
                      {copiedCsv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCsv ? '已复制' : '复制 CSV'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-hub-bg font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-hub-border/70 select-all">
                    {currentContract.sampleCsv}
                  </pre>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: 数据转接与合规校验工作台 */}
        {/* ======================================================== */}
        {activeTab === 'validator' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-hub-card border border-hub-border space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-hub-teal" />
                <span>跨项目 CSV 数据合规校验与转接测试台</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                在将子项目导出的数据文件上传至下一环节工具前，在此处快速校验是否缺少必要表头、数值类型是否合规，杜绝因格式错乱导致的流水线报错。
              </p>
            </div>

            {/* Target Contract Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-hub-panel border border-hub-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-300">校验目标契约：</span>
                <select
                  value={testContractId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setTestContractId(newId);
                    const matched = DATA_CONTRACTS.find((c) => c.id === newId);
                    if (matched) setInputCsv(matched.sampleCsv);
                    setValidationReport({ status: 'idle', message: '', rowCount: 0, errors: [] });
                  }}
                  className="bg-hub-bg border border-hub-border rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-hub-gold font-mono"
                >
                  {DATA_CONTRACTS.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} · {c.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setInputCsv(activeTestContract.sampleCsv);
                  setValidationReport({ status: 'idle', message: '', rowCount: 0, errors: [] });
                }}
                className="text-xs font-mono text-hub-gold hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <RefreshCw className="w-3 h-3" />
                <span>重置为该契约官方示例</span>
              </button>
            </div>

            {/* CSV Input Editor */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">
                粘贴或编辑 CSV 数据内容 (包含表头)：
              </label>
              <textarea
                value={inputCsv}
                onChange={(e) => setInputCsv(e.target.value)}
                rows={7}
                className="w-full text-xs font-mono bg-hub-bg border border-hub-border rounded-xl p-3.5 text-slate-200 focus:outline-none focus:border-hub-gold/50 leading-relaxed"
                placeholder="ticker,announcement_date,fiscal_year,..."
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleValidateCsv}
                className="px-4 py-2 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>运行合规校验</span>
              </button>

              <button
                onClick={() => handleCopy(inputCsv)}
                className="px-3 py-2 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border text-xs text-slate-300 hover:text-white transition-colors"
              >
                {copiedCsv ? '已复制' : '复制此 CSV'}
              </button>
            </div>

            {/* Validation Result Banner */}
            {validationReport.status !== 'idle' && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                  validationReport.status === 'success'
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {validationReport.status === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{validationReport.message}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{validationReport.message}</span>
                    </>
                  )}
                </div>

                {validationReport.errors.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 font-mono text-[11px] pt-1">
                    {validationReport.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: 跨项目 Micro-Header 嵌入规范 */}
        {/* ======================================================== */}
        {activeTab === 'microheader' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-hub-card border border-hub-border animate-in fade-in duration-150">
            <MicroHeaderDemo />
          </div>
        )}

      </div>
    </section>
  );
};
