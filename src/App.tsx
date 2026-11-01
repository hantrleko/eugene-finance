import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WorkbenchSection } from './components/WorkbenchSection';
import { ContextDispatcher } from './components/ContextDispatcher';
import { PlaybooksSection } from './components/PlaybooksSection';
import { CatalogSection } from './components/CatalogSection';
import { ResearchNotesSection } from './components/ResearchNotesSection';
import { DataContractsSection } from './components/DataContractsSection';
import { ExplorationSection } from './components/ExplorationSection';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { ProjectModal } from './components/ProjectModal';
import { PlaybookModal } from './components/PlaybookModal';
import { ResearchNoteModal } from './components/ResearchNoteModal';
import { useWorkbench } from './hooks/useWorkbench';
import { Project, Playbook, ResearchNote, DomainId, TargetGoal, ActiveTab } from './types';
import { PROJECTS } from './data/projects';
import { PLAYBOOKS } from './data/playbooks';
import { RESEARCH_NOTES } from './data/researchNotes';
import { ArrowRight, Layers, ScrollText, Calendar } from 'lucide-react';

// Hash parsing for deep linking (e.g. #workbench, #catalog?domain=02-company, #notes, #note=note-cmb-valuation-2026, #project=quant-risk-lab, #playbook=playbook-a)
function parseHash(hashStr: string) {
  const clean = hashStr.replace(/^#\/?/, '');
  if (!clean) return { tab: 'workbench' as ActiveTab };

  const [routePart, queryPart] = clean.split('?');
  const params = new URLSearchParams(queryPart || '');

  if (routePart.startsWith('project=') || routePart.startsWith('project/')) {
    const projectId = routePart.split(/[/=]/)[1];
    return { tab: 'catalog' as ActiveTab, projectId };
  }

  if (routePart.startsWith('playbook=') || routePart.startsWith('playbook/')) {
    const playbookId = routePart.split(/[/=]/)[1];
    return { tab: 'workbench' as ActiveTab, playbookId };
  }

  if (routePart.startsWith('note=') || routePart.startsWith('note/')) {
    const noteId = routePart.split(/[/=]/)[1];
    return { tab: 'notes' as ActiveTab, noteId };
  }

  let tab: ActiveTab = 'workbench';
  if (routePart === 'catalog' || routePart === 'tools') tab = 'catalog';
  else if (routePart === 'notes' || routePart === 'research') tab = 'notes';
  else if (routePart === 'contracts' || routePart === 'data') tab = 'contracts';
  else if (routePart === 'exploration') tab = 'exploration';

  return {
    tab,
    domain: params.get('domain') as DomainId | null,
    goal: params.get('goal') as TargetGoal | null,
    projectId: params.get('project'),
    playbookId: params.get('playbook'),
    noteId: params.get('note'),
  };
}

export function App() {
  const {
    pinnedProjects,
    recentProjects,
    isPinned,
    togglePin,
    movePinned,
    exportConfig,
    importConfig,
    recordOpen,
    clearRecent,
    resetPinnedToDefault,
  } = useWorkbench();

  // Active view tab: 'workbench' | 'catalog' | 'notes' | 'exploration'
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    return parseHash(window.location.hash).tab;
  });

  // Modals & Panels state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);
  const [selectedNote, setSelectedNote] = useState<ResearchNote | null>(null);
  const [navigatedFromPlaybook, setNavigatedFromPlaybook] = useState<Playbook | null>(null);

  // Filters state in Catalog
  const [selectedDomain, setSelectedDomain] = useState<DomainId | 'all'>('all');
  const [selectedGoal, setSelectedGoal] = useState<TargetGoal | 'all'>('all');

  // Sync state from URL hash
  const syncFromHash = useCallback(() => {
    const parsed = parseHash(window.location.hash);
    if (parsed.tab) {
      setActiveTab(parsed.tab);
    }
    if (parsed.domain) {
      setSelectedDomain(parsed.domain);
    }
    if (parsed.goal) {
      setSelectedGoal(parsed.goal);
    }
    if (parsed.projectId) {
      const p = PROJECTS.find((item) => item.id === parsed.projectId);
      if (p) setDetailProject(p);
    }
    if (parsed.playbookId) {
      const pb = PLAYBOOKS.find((item) => item.id === parsed.playbookId);
      if (pb) setActivePlaybook(pb);
    }
    if (parsed.noteId) {
      const n = RESEARCH_NOTES.find((item) => item.id === parsed.noteId);
      if (n) setSelectedNote(n);
    }
  }, []);

  // Initial deep link check & hashchange listener
  useEffect(() => {
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [syncFromHash]);

  // Sync tab switch to URL hash
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Open modal with deep linking
  const handleOpenDetailModal = (project: Project) => {
    setNavigatedFromPlaybook(null);
    setDetailProject(project);
    window.history.replaceState(null, '', `#project=${project.id}`);
  };

  const handleCloseDetailModal = () => {
    setDetailProject(null);
    setNavigatedFromPlaybook(null);
    window.history.replaceState(null, '', `#${activeTab}`);
  };

  const handleOpenPlaybookModal = (playbook: Playbook) => {
    setNavigatedFromPlaybook(null);
    setActivePlaybook(playbook);
    window.history.replaceState(null, '', `#playbook=${playbook.id}`);
  };

  const handleClosePlaybookModal = () => {
    setActivePlaybook(null);
    window.history.replaceState(null, '', `#${activeTab}`);
  };

  const handleOpenNoteModal = (note: ResearchNote) => {
    setSelectedNote(note);
    window.history.replaceState(null, '', `#note=${note.id}`);
  };

  const handleCloseNoteModal = () => {
    setSelectedNote(null);
    window.history.replaceState(null, '', `#${activeTab}`);
  };

  // Global Keyboard shortcuts: Ctrl+K / Cmd+K and Alt+1~5 tab switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          handleTabChange('workbench');
        } else if (e.key === '2') {
          e.preventDefault();
          handleTabChange('catalog');
        } else if (e.key === '3') {
          e.preventDefault();
          handleTabChange('notes');
        } else if (e.key === '4') {
          e.preventDefault();
          handleTabChange('contracts');
        } else if (e.key === '5') {
          e.preventDefault();
          handleTabChange('exploration');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // External open handler: records in recent and opens link
  const handleOpenProjectExternal = (project: Project) => {
    recordOpen(project.id);
    const targetUrl = project.officialUrl || project.repoUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      handleOpenDetailModal(project);
    }
  };

  // Target goal click in Hero -> switch to catalog and filter
  const handleSelectGoalFromHero = (goal: TargetGoal) => {
    setSelectedGoal(goal);
    setActiveTab('catalog');
    window.location.hash = `catalog?goal=${goal}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Seamless modal flow: from Playbook into Project specification
  const handleSelectProjectFromPlaybook = (project: Project, playbook: Playbook) => {
    setActivePlaybook(null);
    setNavigatedFromPlaybook(playbook);
    setDetailProject(project);
    window.history.replaceState(null, '', `#project=${project.id}`);
  };

  // Back from Project specification to Playbook
  const handleBackToPlaybook = () => {
    if (navigatedFromPlaybook) {
      const pb = navigatedFromPlaybook;
      setDetailProject(null);
      setNavigatedFromPlaybook(null);
      setActivePlaybook(pb);
      window.history.replaceState(null, '', `#playbook=${pb.id}`);
    }
  };

  // Sequential browsing in Project Specification Drawer
  const currentProjectIndex = detailProject
    ? PROJECTS.findIndex((p) => p.id === detailProject.id)
    : -1;

  const handlePrevProject = useCallback(() => {
    if (currentProjectIndex < 0) return;
    const prevIndex = (currentProjectIndex - 1 + PROJECTS.length) % PROJECTS.length;
    handleOpenDetailModal(PROJECTS[prevIndex]);
  }, [currentProjectIndex]);

  const handleNextProject = useCallback(() => {
    if (currentProjectIndex < 0) return;
    const nextIndex = (currentProjectIndex + 1) % PROJECTS.length;
    handleOpenDetailModal(PROJECTS[nextIndex]);
  }, [currentProjectIndex]);

  return (
    <div className="min-h-screen bg-hub-bg text-hub-text flex flex-col font-sans selection:bg-hub-gold/25 selection:text-hub-goldLight">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area based on View Tab */}
      <main className="flex-1">
        
        {/* ======================================================== */}
        {/* VIEW 1: WORKBENCH (轻快工作台 + 参数直达 + 研究路径) */}
        {/* ======================================================== */}
        {activeTab === 'workbench' && (
          <div className="animate-in fade-in duration-200">
            {/* Hero Section */}
            <Hero
              onOpenSearch={() => setIsSearchOpen(true)}
              onSelectTargetGoal={handleSelectGoalFromHero}
              activeGoal={selectedGoal === 'all' ? null : selectedGoal}
            />

            {/* Workbench Section (常用工具 + 最近打开 + 排序与备份) */}
            <WorkbenchSection
              pinnedProjects={pinnedProjects}
              recentProjects={recentProjects}
              isPinned={isPinned}
              onTogglePin={togglePin}
              onMovePinned={movePinned}
              onOpenProjectExternal={handleOpenProjectExternal}
              onSelectProject={handleOpenDetailModal}
              onClearRecent={clearRecent}
              onResetPinned={resetPinnedToDefault}
              onExportConfig={exportConfig}
              onImportConfig={importConfig}
              onNavigateToCatalog={() => handleTabChange('catalog')}
            />

            {/* Context Dispatcher (跨系统上下文参数直达 Protocol) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <ContextDispatcher onRecordOpen={recordOpen} />
            </div>

            {/* Research Notes Preview Strip on Workbench */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-hub-card/60 border border-hub-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-hub-gold/15 text-hub-gold flex items-center justify-center border border-hub-gold/30 flex-shrink-0">
                    <ScrollText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">
                        最新研究底稿与复盘归档
                      </h4>
                      <span className="text-[10px] font-mono text-hub-gold bg-hub-gold/10 px-1.5 py-0.2 rounded border border-hub-gold/20">
                        {RESEARCH_NOTES.length} 篇归档
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      最新：《{RESEARCH_NOTES[0].title}》 · {RESEARCH_NOTES[0].date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenNoteModal(RESEARCH_NOTES[0])}
                    className="px-3 py-1.5 rounded-lg bg-hub-panel hover:bg-hub-card text-xs text-slate-200 border border-hub-border hover:border-slate-500 transition-colors"
                  >
                    阅读最新一篇
                  </button>
                  <button
                    onClick={() => handleTabChange('notes')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-semibold text-xs transition-colors shadow-sm"
                  >
                    <span>进入研究成果库</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Research Playbooks (三条首发研究路径) */}
            <PlaybooksSection
              onOpenPlaybook={handleOpenPlaybookModal}
            />

            {/* Bottom transition banner into All Tools */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-hub-panel via-hub-card to-hub-panel border border-hub-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-hub-gold/15 text-hub-gold flex items-center justify-center border border-hub-gold/30 flex-shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      查看完整研究版图
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      涵盖市场宏观、公司产业、策略组合、微观衍生品及学术体系全量 {PROJECTS.length} 个工具
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleTabChange('catalog')}
                  className="px-4 py-2 rounded-lg bg-hub-gold hover:bg-hub-goldLight text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm flex-shrink-0"
                >
                  <span>进入全部工具目录</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: ALL TOOLS (全部工具：六大领域 + 多维筛选目录) */}
        {/* ======================================================== */}
        {activeTab === 'catalog' && (
          <div className="animate-in fade-in duration-200">
            <CatalogSection
              selectedDomain={selectedDomain}
              onSelectDomain={(d) => {
                setSelectedDomain(d);
                window.history.replaceState(null, '', d === 'all' ? '#catalog' : `#catalog?domain=${d}`);
              }}
              selectedGoal={selectedGoal}
              onSelectGoal={(g) => {
                setSelectedGoal(g);
                window.history.replaceState(null, '', g === 'all' ? '#catalog' : `#catalog?goal=${g}`);
              }}
              isPinned={isPinned}
              onTogglePin={togglePin}
              onSelectProject={handleOpenDetailModal}
              onOpenProjectExternal={handleOpenProjectExternal}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: RESEARCH NOTES (研究成果与复盘库 · 知识飞轮) */}
        {/* ======================================================== */}
        {activeTab === 'notes' && (
          <div className="animate-in fade-in duration-200">
            <ResearchNotesSection
              onSelectNote={handleOpenNoteModal}
              onSelectProject={handleOpenDetailModal}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: DATA CONTRACTS (数据契约与跨项目转接中心 V3.0) */}
        {/* ======================================================== */}
        {activeTab === 'contracts' && (
          <div className="animate-in fade-in duration-200">
            <DataContractsSection
              onSelectProject={handleOpenDetailModal}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: EXPLORATION (探索与创作：历史地理自然 + 媒体空间) */}
        {/* ======================================================== */}
        {activeTab === 'exploration' && (
          <div className="animate-in fade-in duration-200">
            <ExplorationSection
              onSelectProject={handleOpenDetailModal}
              onOpenProjectExternal={handleOpenProjectExternal}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Global Command Palette Search Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProject={handleOpenDetailModal}
        onSelectPlaybook={handleOpenPlaybookModal}
        onOpenProjectExternal={handleOpenProjectExternal}
        isPinned={isPinned}
        onTogglePin={togglePin}
      />

      {/* Unified Project Specification Drawer / Modal */}
      <ProjectModal
        project={detailProject}
        isOpen={Boolean(detailProject)}
        onClose={handleCloseDetailModal}
        fromPlaybook={navigatedFromPlaybook}
        onBackToPlaybook={handleBackToPlaybook}
        isPinned={detailProject ? isPinned(detailProject.id) : false}
        onTogglePin={togglePin}
        onOpenExternal={handleOpenProjectExternal}
        onOpenPlaybook={(pb) => {
          setDetailProject(null);
          setNavigatedFromPlaybook(null);
          handleOpenPlaybookModal(pb);
        }}
        onOpenResearchNote={(note) => {
          setDetailProject(null);
          setNavigatedFromPlaybook(null);
          handleOpenNoteModal(note);
        }}
        onPrevProject={handlePrevProject}
        onNextProject={handleNextProject}
        currentIndex={currentProjectIndex}
        totalProjects={PROJECTS.length}
      />

      {/* Playbook Detailed Modal */}
      <PlaybookModal
        playbook={activePlaybook}
        onClose={handleClosePlaybookModal}
        onSelectProjectFromPlaybook={handleSelectProjectFromPlaybook}
        onOpenProjectExternal={handleOpenProjectExternal}
      />

      {/* Research Note Reading Modal */}
      <ResearchNoteModal
        note={selectedNote}
        onClose={handleCloseNoteModal}
        onSelectProject={handleOpenDetailModal}
        onOpenProjectExternal={handleOpenProjectExternal}
      />

    </div>
  );
}

export default App;
