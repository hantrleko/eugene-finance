import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WorkbenchSection } from './components/WorkbenchSection';
import { PlaybooksSection } from './components/PlaybooksSection';
import { CatalogSection } from './components/CatalogSection';
import { ExplorationSection } from './components/ExplorationSection';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { ProjectModal } from './components/ProjectModal';
import { PlaybookModal } from './components/PlaybookModal';
import { useWorkbench } from './hooks/useWorkbench';
import { Project, Playbook, DomainId, TargetGoal, ActiveTab } from './types';
import { PROJECTS } from './data/projects';
import { ArrowRight, Layers } from 'lucide-react';

export function App() {
  const {
    pinnedProjects,
    recentProjects,
    isPinned,
    togglePin,
    recordOpen,
    clearRecent,
    resetPinnedToDefault,
  } = useWorkbench();

  // Active view tab: 'workbench' | 'catalog' | 'exploration' (defaults to 'workbench')
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'catalog' || hash === 'tools') return 'catalog';
    if (hash === 'exploration') return 'exploration';
    return 'workbench';
  });

  // Modals & Panels state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);
  const [navigatedFromPlaybook, setNavigatedFromPlaybook] = useState<Playbook | null>(null);

  // Filters state in Catalog
  const [selectedDomain, setSelectedDomain] = useState<DomainId | 'all'>('all');
  const [selectedGoal, setSelectedGoal] = useState<TargetGoal | 'all'>('all');

  // Sync tab with URL hash
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'catalog' || hash === 'tools') {
        setActiveTab('catalog');
      } else if (hash === 'exploration') {
        setActiveTab('exploration');
      } else if (hash === 'workbench') {
        setActiveTab('workbench');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Keyboard shortcuts: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
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
      setDetailProject(project);
    }
  };

  // Target goal click in Hero -> switch to catalog and filter
  const handleSelectGoalFromHero = (goal: TargetGoal) => {
    setSelectedGoal(goal);
    setActiveTab('catalog');
    window.location.hash = 'catalog';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Seamless modal flow: from Playbook into Project specification
  const handleSelectProjectFromPlaybook = (project: Project, playbook: Playbook) => {
    setActivePlaybook(null);
    setNavigatedFromPlaybook(playbook);
    setDetailProject(project);
  };

  // Back from Project specification to Playbook
  const handleBackToPlaybook = () => {
    if (navigatedFromPlaybook) {
      const pb = navigatedFromPlaybook;
      setDetailProject(null);
      setNavigatedFromPlaybook(null);
      setActivePlaybook(pb);
    }
  };

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
        {/* VIEW 1: WORKBENCH (默认打开：轻快工作台 + 研究路径) */}
        {/* ======================================================== */}
        {activeTab === 'workbench' && (
          <div className="animate-in fade-in duration-200">
            {/* Hero Section */}
            <Hero
              onOpenSearch={() => setIsSearchOpen(true)}
              onSelectTargetGoal={handleSelectGoalFromHero}
              activeGoal={selectedGoal === 'all' ? null : selectedGoal}
            />

            {/* Workbench Section (常用工具 + 最近打开) */}
            <WorkbenchSection
              pinnedProjects={pinnedProjects}
              recentProjects={recentProjects}
              isPinned={isPinned}
              onTogglePin={togglePin}
              onOpenProjectExternal={handleOpenProjectExternal}
              onSelectProject={(p) => {
                setNavigatedFromPlaybook(null);
                setDetailProject(p);
              }}
              onClearRecent={clearRecent}
              onResetPinned={resetPinnedToDefault}
              onNavigateToCatalog={() => handleTabChange('catalog')}
            />

            {/* Research Playbooks (三条首发研究路径) */}
            <PlaybooksSection
              onOpenPlaybook={(pb) => {
                setNavigatedFromPlaybook(null);
                setActivePlaybook(pb);
              }}
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
              onSelectDomain={setSelectedDomain}
              selectedGoal={selectedGoal}
              onSelectGoal={setSelectedGoal}
              isPinned={isPinned}
              onTogglePin={togglePin}
              onSelectProject={(p) => {
                setNavigatedFromPlaybook(null);
                setDetailProject(p);
              }}
              onOpenProjectExternal={handleOpenProjectExternal}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: EXPLORATION (探索与创作：历史地理自然 + 媒体空间) */}
        {/* ======================================================== */}
        {activeTab === 'exploration' && (
          <div className="animate-in fade-in duration-200">
            <ExplorationSection
              onSelectProject={(p) => {
                setNavigatedFromPlaybook(null);
                setDetailProject(p);
              }}
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
        onSelectProject={(p) => {
          setNavigatedFromPlaybook(null);
          setDetailProject(p);
        }}
        onSelectPlaybook={(pb) => {
          setNavigatedFromPlaybook(null);
          setActivePlaybook(pb);
        }}
        onOpenProjectExternal={handleOpenProjectExternal}
      />

      {/* Unified Project Specification Drawer / Modal */}
      <ProjectModal
        project={detailProject}
        isOpen={Boolean(detailProject)}
        onClose={() => {
          setDetailProject(null);
          setNavigatedFromPlaybook(null);
        }}
        fromPlaybook={navigatedFromPlaybook}
        onBackToPlaybook={handleBackToPlaybook}
        isPinned={detailProject ? isPinned(detailProject.id) : false}
        onTogglePin={togglePin}
        onOpenExternal={handleOpenProjectExternal}
        onOpenPlaybook={(pb) => {
          setDetailProject(null);
          setNavigatedFromPlaybook(null);
          setActivePlaybook(pb);
        }}
      />

      {/* Playbook Detailed Modal */}
      <PlaybookModal
        playbook={activePlaybook}
        onClose={() => setActivePlaybook(null)}
        onSelectProjectFromPlaybook={handleSelectProjectFromPlaybook}
        onOpenProjectExternal={handleOpenProjectExternal}
      />

    </div>
  );
}

export default App;
