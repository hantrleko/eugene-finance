import React, { useState } from 'react';
import { ScrollText, Search, BookOpen, Layers, ArrowRight, Calendar, User, Tag, ExternalLink } from 'lucide-react';
import { ResearchNote, Project, DomainId, TargetGoal } from '../types';
import { RESEARCH_NOTES } from '../data/researchNotes';
import { PLAYBOOKS } from '../data/playbooks';
import { PROJECTS } from '../data/projects';

interface ResearchNotesSectionProps {
  onSelectNote: (note: ResearchNote) => void;
  onSelectProject: (project: Project) => void;
}

export const ResearchNotesSection: React.FC<ResearchNotesSectionProps> = ({
  onSelectNote,
  onSelectProject,
}) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<TargetGoal | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredNotes = RESEARCH_NOTES.filter((note) => {
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

  return (
    <section id="notes" className="py-10 border-b border-hub-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-hub-gold uppercase tracking-wider mb-1.5">
            <ScrollText className="w-4 h-4" />
            <span>RESEARCH ARTIFACTS & MEMOS</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
                <span>研究成果与复盘库</span>
                <span className="text-xs font-mono text-hub-gold bg-hub-gold/10 px-2 py-0.5 rounded border border-hub-gold/20 font-normal">
                  共 {RESEARCH_NOTES.length} 篇研究底稿
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                按照标准化研究路径沉淀的深度报告、实证计量论文与可审计投资复盘，与 26 个专业分析工具双向贯通。
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-xl bg-hub-panel/80 border border-hub-border space-y-4 mb-8">
          
          {/* Playbook Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                研究路径归属：
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPlaybook('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedPlaybook === 'all'
                    ? 'bg-hub-gold text-slate-950 font-bold shadow-sm'
                    : 'bg-hub-card text-slate-300 hover:bg-hub-cardHover border border-hub-border'
                }`}
              >
                全部路径 ({RESEARCH_NOTES.length})
              </button>

              {PLAYBOOKS.map((pb) => {
                const count = RESEARCH_NOTES.filter((n) => n.playbookId === pb.id).length;
                const isSelected = selectedPlaybook === pb.id;
                return (
                  <button
                    key={pb.id}
                    onClick={() => setSelectedPlaybook(pb.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
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

          {/* Goal Filter & Search Input */}
          <div className="pt-3 border-t border-hub-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            
            {/* Goal filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-slate-400 text-[11px]">研判目标：</span>
              <button
                onClick={() => setSelectedGoal('all')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedGoal === 'all'
                    ? 'bg-hub-bg text-slate-100 border border-slate-500 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                全部目标
              </button>
              <button
                onClick={() => setSelectedGoal('company')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedGoal === 'company'
                    ? 'bg-hub-teal/20 text-hub-tealLight border border-hub-teal/40 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                公司与行业
              </button>
              <button
                onClick={() => setSelectedGoal('academic')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedGoal === 'academic'
                    ? 'bg-hub-gold/20 text-hub-goldLight border border-hub-gold/40 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                学术实证
              </button>
              <button
                onClick={() => setSelectedGoal('investment')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedGoal === 'investment'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                投资决策
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索成果标题、结论或标签..."
                className="w-full bg-hub-card border border-hub-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hub-gold/50"
              />
            </div>

          </div>

        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map((note) => {
            const associatedProjects = note.associatedProjectIds
              .map((id) => PROJECTS.find((p) => p.id === id))
              .filter((p): p is Project => Boolean(p));

            return (
              <div
                key={note.id}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-hub-card/85 hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/40 transition-all duration-150 shadow-sm"
              >
                <div>
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-hub-gold/15 text-hub-gold border border-hub-gold/30 font-semibold">
                        路径 {note.playbookLetter}
                      </span>
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-hub-panel text-slate-400 border border-hub-border">
                        {note.domainName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{note.date}</span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mb-3">
                    <h3
                      onClick={() => onSelectNote(note)}
                      className="text-base font-bold text-slate-100 group-hover:text-hub-goldLight cursor-pointer transition-colors leading-snug"
                    >
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {note.subtitle}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {note.summary}
                  </p>

                  {/* Key Metrics Chips */}
                  {note.metrics && note.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {note.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="p-2 rounded bg-hub-panel/60 border border-hub-border/60">
                          <span className="text-[10px] text-slate-400 block font-mono">{m.label}</span>
                          <span className="text-xs font-bold text-hub-goldLight font-mono block truncate">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-hub-bg text-slate-400 border border-hub-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Associated Toolchain & Read Action */}
                <div className="pt-3 border-t border-hub-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400">调用工具：</span>
                    {associatedProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onSelectProject(p)}
                        className="px-1.5 py-0.5 rounded bg-hub-panel hover:bg-hub-card text-hub-goldLight text-[10px] font-mono border border-hub-border hover:border-hub-gold/40 transition-colors"
                        title="查看工具规格"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => onSelectNote(note)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-semibold text-xs transition-colors self-start sm:self-auto flex-shrink-0"
                  >
                    <span>阅读底稿全文</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
