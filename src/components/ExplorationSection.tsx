import React from 'react';
import { Sparkles, ExternalLink, Compass, Map, Waves, Shield, BookOpen, Video, Headphones, FileText, ArrowRight } from 'lucide-react';
import { PROJECTS } from '../data/projects';
import { MEDIA_ITEMS } from '../data/media';
import { Project } from '../types';

interface ExplorationSectionProps {
  onSelectProject: (project: Project) => void;
  onOpenProjectExternal: (project: Project) => void;
}

export const ExplorationSection: React.FC<ExplorationSectionProps> = ({
  onSelectProject,
  onOpenProjectExternal,
}) => {
  // Get the 4 exploration projects
  const exploreProjects = PROJECTS.filter((p) => p.domainId === '06-explore');

  const getExploreIcon = (id: string) => {
    switch (id) {
      case 'shaanxi-sandbox':
        return <Map className="w-5 h-5 text-amber-400" />;
      case 'ocean-atlas':
        return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'huaxia-fenghuo':
        return <Shield className="w-5 h-5 text-rose-400" />;
      case 'pet-words':
        return <BookOpen className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-hub-gold" />;
    }
  };

  const getMediaCategoryIcon = (category: string) => {
    switch (category) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'podcast':
        return <Headphones className="w-3.5 h-3.5 text-cyan-400" />;
      case 'essay':
      case 'article':
      default:
        return <FileText className="w-3.5 h-3.5 text-hub-gold" />;
    }
  };

  return (
    <section id="exploration" className="py-16 border-b border-hub-border bg-gradient-to-b from-hub-bg via-hub-panel/40 to-hub-bg relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[250px] bg-hub-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs font-mono text-hub-gold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>06 / EXPLORATION & CREATION</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-sans">
                探索与创作空间
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                严肃研究之外的独立精神角落。涵盖自然地理、古代战役推演、海洋标本与多维语言挑战，保留个人审美品味与叙事作品感。
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              独立分区 · 不与金融工具混排
            </span>
          </div>
        </div>

        {/* Part 1: Four Distinct Works Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {exploreProjects.map((proj) => {
            return (
              <div
                key={proj.id}
                className="group relative flex flex-col justify-between rounded-xl bg-hub-card/90 hover:bg-hub-cardHover border border-hub-border hover:border-hub-gold/50 p-5 transition-all duration-300 shadow-subtle hover:shadow-gold-glow flex-1"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-hub-panel flex items-center justify-center border border-hub-border group-hover:border-hub-gold/40 transition-colors">
                      {getExploreIcon(proj.id)}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      已有版本
                    </span>
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => onSelectProject(proj)}
                    className="text-base font-bold text-slate-100 group-hover:text-hub-goldLight cursor-pointer transition-colors mb-1"
                  >
                    {proj.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 mb-3 line-clamp-1">
                    {proj.enName}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {proj.summary}
                  </p>

                  {/* Method tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {proj.methodTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-hub-bg text-slate-400 border border-hub-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-hub-border/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectProject(proj)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    作品说明
                  </button>

                  {(proj.officialUrl || proj.repoUrl) && (
                    <button
                      onClick={() => onOpenProjectExternal(proj)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-gold/20 text-hub-goldLight hover:text-white border border-hub-gold/30 hover:border-hub-gold transition-all text-xs font-medium"
                    >
                      <span>进入体验</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Part 2: Media Space / Essays & Notes */}
        <div className="pt-10 border-t border-hub-border/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>媒体空间 · 专栏、短片与思考手记</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                记录投资实践、学术论文思考、音画代码实验与小红书连载随笔
              </p>
            </div>
            <span className="text-[11px] font-mono text-hub-gold bg-hub-gold/10 px-2 py-0.5 rounded border border-hub-gold/20 hidden sm:inline">
              持续更新中
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MEDIA_ITEMS.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-hub-card/70 hover:bg-hub-cardHover border border-hub-border hover:border-hub-borderHover transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      {getMediaCategoryIcon(item.category)}
                      <span>{item.categoryLabel}</span>
                    </span>
                    <span className="text-slate-400">{item.durationOrReadTime}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-200 group-hover:text-hub-goldLight transition-colors mb-2 leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-hub-border/50 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.date} {item.highlightTag && `· ${item.highlightTag}`}
                  </span>

                  {item.link && item.link !== '#' ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-hub-teal hover:text-hub-tealLight flex items-center gap-1 transition-colors text-xs font-medium"
                    >
                      <span>阅读/观看</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-[11px]">站内归档</span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
