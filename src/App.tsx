import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WorkbenchSection } from './components/WorkbenchSection';
import { DomainsOverview } from './components/DomainsOverview';
import { PlaybooksSection } from './components/PlaybooksSection';
import { CatalogSection } from './components/CatalogSection';
import { ExplorationSection } from './components/ExplorationSection';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { ProjectModal } from './components/ProjectModal';
import { PlaybookModal } from './components/PlaybookModal';
import { useWorkbench } from './hooks/useWorkbench';
import { Project, Playbook, DomainId, TargetGoal } from './types';

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

  // Modals & Panels state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);

  // Filters state
  const [selectedDomain, setSelectedDomain] = useState<DomainId | 'all'>('all');
  const [selectedGoal, setSelectedGoal] = useState<TargetGoal | 'all'>('all');
  const [activeNavSection, setActiveNavSection] = useState('workbench');

  // Global Keyboard shortcuts: Ctrl+K / Cmd+K / Slash
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

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['workbench', 'playbooks', 'catalog', 'exploration'];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveNavSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // External open handler: records in recent and opens link
  const handleOpenProjectExternal = (project: Project) => {
    recordOpen(project.id);
    const targetUrl = project.officialUrl || project.repoUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      // If no URL (e.g. planned or local only), open detail drawer
      setDetailProject(project);
    }
  };

  // Target goal click in Hero -> scroll to catalog
  const handleSelectGoal = (goal: TargetGoal) => {
    if (selectedGoal === goal) {
      setSelectedGoal('all');
    } else {
      setSelectedGoal(goal);
    }
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Domain click in Overview -> scroll to catalog
  const handleSelectDomain = (domainId: DomainId) => {
    setSelectedDomain(domainId);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-hub-bg text-hub-text flex flex-col font-sans selection:bg-hub-gold/25 selection:text-hub-goldLight">
      
      {/* Top Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        activeSection={activeNavSection}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <Hero
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectTargetGoal={handleSelectGoal}
          activeGoal={selectedGoal === 'all' ? null : selectedGoal}
        />

        {/* 1. Workbench Section (Pinned & Recent) */}
        <WorkbenchSection
          pinnedProjects={pinnedProjects}
          recentProjects={recentProjects}
          isPinned={isPinned}
          onTogglePin={togglePin}
          onOpenProjectExternal={handleOpenProjectExternal}
          onSelectProject={(p) => setDetailProject(p)}
          onClearRecent={clearRecent}
          onResetPinned={resetPinnedToDefault}
        />

        {/* 2. Domains Overview Cards (3x2 Grid) */}
        <DomainsOverview
          onSelectDomain={handleSelectDomain}
        />

        {/* 3. Research Playbooks Section */}
        <PlaybooksSection
          onOpenPlaybook={(pb) => setActivePlaybook(pb)}
        />

        {/* 4. Complete Catalog Section */}
        <CatalogSection
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
          selectedGoal={selectedGoal}
          onSelectGoal={setSelectedGoal}
          isPinned={isPinned}
          onTogglePin={togglePin}
          onSelectProject={(p) => setDetailProject(p)}
          onOpenProjectExternal={handleOpenProjectExternal}
        />

        {/* 5. Independent Exploration & Creation Section */}
        <ExplorationSection
          onSelectProject={(p) => setDetailProject(p)}
          onOpenProjectExternal={handleOpenProjectExternal}
        />

      </main>

      {/* Footer */}
      <Footer />

      {/* Global Command Palette Search Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProject={(p) => setDetailProject(p)}
        onSelectPlaybook={(pb) => setActivePlaybook(pb)}
        onOpenProjectExternal={handleOpenProjectExternal}
      />

      {/* Project Specification Drawer / Modal */}
      <ProjectModal
        project={detailProject}
        isOpen={Boolean(detailProject)}
        onClose={() => setDetailProject(null)}
        isPinned={detailProject ? isPinned(detailProject.id) : false}
        onTogglePin={togglePin}
        onOpenExternal={handleOpenProjectExternal}
        onOpenPlaybook={(pb) => setActivePlaybook(pb)}
      />

      {/* Playbook Detailed Modal */}
      <PlaybookModal
        playbook={activePlaybook}
        onClose={() => setActivePlaybook(null)}
        onSelectProject={(p) => setDetailProject(p)}
        onOpenProjectExternal={handleOpenProjectExternal}
      />

    </div>
  );
}

export default App;
