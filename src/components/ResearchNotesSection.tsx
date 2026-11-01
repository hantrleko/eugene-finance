import React, { useState, useMemo, useRef } from 'react';
import { 
  ScrollText, Search, BookOpen, Layers, ArrowRight, Calendar, 
  User, Tag, ExternalLink, Plus, Upload, CheckCircle2, AlertCircle, FileText 
} from 'lucide-react';
import { ResearchNote, Project, DomainId, TargetGoal } from '../types';
import { RESEARCH_NOTES } from '../data/researchNotes';
import { PLAYBOOKS } from '../data/playbooks';
import { PROJECTS } from '../data/projects';
import { useToast } from '../context/ToastContext';

interface ResearchNotesSectionProps {
  customNotes?: ResearchNote[];
  onSelectNote: (note: ResearchNote) => void;
  onSelectProject: (project: Project) => void;
  onAddCustomNote?: (note: ResearchNote) => void;
  onDeleteCustomNote?: (id: string) => void;
}

export const ResearchNotesSection: React.FC<ResearchNotesSectionProps> = ({
  customNotes = [],
  onSelectNote,
  onSelectProject,
  onAddCustomNote,
  onDeleteCustomNote,
}) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<TargetGoal | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'verified' | 'demo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Combine all notes
  const allNotes = useMemo(() => {
    return [...customNotes, ...RESEARCH_NOTES];
  }, [customNotes]);

  const verifiedCount = customNotes.length;
  const demoCount = RESEARCH_NOTES.length;

  // Filtering
  const filteredNotes = allNotes.filter((note) => {
    if (typeFilter === 'verified' && note.isDemo) return false;
    if (typeFilter === 'demo' && !note.isDemo) return false;
    if (selectedPlaybook !== 'all' && note.playbookId !== selectedPlaybook) return false;
    if (selectedGoal !== 'all' && note.targetGoal !== selectedGoal) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        note.title.toLowerCase().includes(q) ||
        note.subtitle.toLowerCase().includes(q) ||
        note.summary.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q)) ||
        note.domainName.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Handle Markdown file import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddCustomNote) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const title = file.name.replace(/\.md$/i, '');
      const newNote: ResearchNote = {
        id: `note-imported-${Date.now().toString(36)}`,
        title: title,
        subtitle: '导入的外部实证研究底稿',
        date: new Date().toISOString().slice(0, 10),
        author: 'Eugene (个人导入)',
        playbookId: 'playbook-a',
        playbookLetter: 'A',
        playbookTitle: '自定研究',
        domainId: '02-company',
        domainName: '公司与产业',
        associatedProjectIds: [],
        targetGoal: 'company',
        tags: ['导入底稿', '本地实证'],
        summary: content.slice(0, 150) + '...',
        keyFindings: ['由本地 Markdown 文件直接解析载入', `原文件名：${file.name}`],
        contentMarkdown: content,
        isDemo: false,
      };
      onAddCustomNote(newNote);
      toast.success(`成功导入研究底稿: ${file.name}`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section id="notes" className="py-10 border-b border-hub-border text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-hub-gold uppercase tracking-wider mb-1.5">
            <ScrollText className="w-4 h-4" />
            <span>RESEARCH VAULT & AUDIT TRAIL</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
                <span>研究成果与复盘库</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 font-normal">
                  {verifiedCount} 篇个人实证
                </span>
                <span className="text-xs font-mono text-hub-gold bg-hub-gold/10 px-2 py-0.5 rounded border border-hub-gold/20 font-normal">
                  {demoCount} 篇示范样本
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                清晰区分个人实证研究底稿与预置教学示范样本，支持从工作台一键沉淀或导入本地 Markdown 成果。
              </p>
            </div>

            {/* Actions: Import Markdown */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".md,.markdown,.txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-hub-panel hover:bg-hub-card border border-hub-border hover:border-hub-gold/40 text-slate-200 transition-colors shadow-sm"
                title="导入本地已有的 Markdown 研报或笔记"
              >
                <Upload className="w-3.5 h-3.5 text-hub-gold" />
                <span>导入 Markdown 底稿</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-xl bg-hub-panel/80 border border-hub-border space-y-4 mb-8">
          
          {/* Category Filter: 全部 / 个人实证 / 示范样本 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hub-border/60">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                底稿性质：
              </span>
              <div className="inline-flex rounded-lg bg-hub-bg p-0.5 border border-hub-border">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1 rounded text-xs transition-all ${
                    typeFilter === 'all'
                      ? 'bg-hub-panel text-slate-100 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  全部 ({allNotes.length})
                </button>
                <button
                  onClick={() => setTypeFilter('verified')}
                  className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                    typeFilter === 'verified'
                      ? 'bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-800/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>个人实证 ({verifiedCount})</span>
                </button>
                <button
                  onClick={() => setTypeFilter('demo')}
                  className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                    typeFilter === 'demo'
                      ? 'bg-hub-gold/20 text-hub-gold font-bold border border-hub-gold/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertCircle className="w-3 h-3 text-hub-gold" />
                  <span>教学示范 ({demoCount})</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索成果标题、标的或标签..."
                className="w-full bg-hub-bg border border-hub-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hub-gold/60"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Playbook Tabs */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
              研究路径：
            </span>
            <button
              onClick={() => setSelectedPlaybook('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedPlaybook === 'all'
                  ? 'bg-hub-gold text-slate-950 font-bold shadow-sm'
                  : 'bg-hub-card text-slate-300 hover:bg-hub-cardHover border border-hub-border'
              }`}
            >
              全部路径
            </button>

            {PLAYBOOKS.map((pb) => {
              const count = allNotes.filter((n) => n.playbookId === pb.id).length;
              const isSelected = selectedPlaybook === pb.id;
              return (
                <button
                  key={pb.id}
                  onClick={() => setSelectedPlaybook(pb.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-hub-gold text-slate-950 font-semibold shadow-sm'
                      : 'bg-hub-card text-slate-300 hover:bg-hub-cardHover border border-hub-border'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-75">路径 {pb.letter}</span>
                  <span>{pb.title}</span>
                  <span className="font-mono text-[10px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Grid */}
        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-hub-card/40 border border-hub-border text-slate-400 text-xs">
            未检索到符合条件的研究成果
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredNotes.map((note) => {
              const isVerified = !note.isDemo;

              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className={`group relative flex flex-col justify-between p-6 rounded-2xl transition-all duration-150 shadow-sm cursor-pointer ${
                    isVerified
                      ? 'bg-hub-card hover:bg-hub-cardHover border border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-hub-card/80 hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/40'
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-hub-gold bg-hub-gold/10 px-2 py-0.5 rounded border border-hub-gold/20 font-bold">
                          路径 {note.playbookLetter} · {note.playbookTitle}
                        </span>
                        {isVerified ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>个人实证底稿</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            <span>示范样本 · Demo</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{note.date}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-hub-goldLight cursor-pointer transition-colors leading-snug mb-1.5">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                      {note.subtitle}
                    </p>

                    {/* Summary */}
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed bg-hub-bg/60 p-3 rounded-xl border border-hub-border/60 mb-3.5">
                      {note.summary}
                    </p>

                    {/* Quantitative Highlight Badges */}
                    {note.metrics && note.metrics.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {note.metrics.slice(0, 4).map((m, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-hub-bg border border-hub-border/50 text-center">
                            <span className="text-[9px] text-slate-400 font-mono block truncate">{m.label}</span>
                            <span className="text-xs font-bold text-hub-goldLight font-mono block truncate">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t border-hub-border/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-400">
                      研究员：{note.author}
                    </span>
                    <span className="flex items-center gap-1 text-hub-gold font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>阅读底稿全文</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
