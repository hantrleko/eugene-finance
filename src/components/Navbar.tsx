import React, { useState, useEffect } from 'react';
import { Search, Compass, Layers, Sparkles, Menu, X, ExternalLink, ScrollText, Database, Sun, Moon } from 'lucide-react';
import { ActiveTab } from '../types';
import { useToast } from '../context/ToastContext';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { info } = useToast();

  const [theme, setTheme] = useState<'dark' | 'paper'>(() => {
    try {
      const saved = localStorage.getItem('ef_theme');
      if (saved === 'paper' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'paper') {
      root.classList.add('paper');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('paper');
    }
    try {
      localStorage.setItem('ef_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'paper' : 'dark';
    setTheme(next);
    info(next === 'paper' ? '已切换至 刊物暖纸 (Editorial Paper) 阅读模式' : '已切换至 曜石暗色 (Obsidian Dark) 工作台模式');
  };

  const navTabs = [
    { id: 'workbench' as ActiveTab, label: '工作台', icon: Compass, shortcut: 'Alt+1' },
    { id: 'catalog' as ActiveTab, label: '全部工具', icon: Layers, shortcut: 'Alt+2' },
    { id: 'notes' as ActiveTab, label: '成果库', icon: ScrollText, shortcut: 'Alt+3' },
    { id: 'contracts' as ActiveTab, label: '数据契约', icon: Database, shortcut: 'Alt+4' },
    { id: 'exploration' as ActiveTab, label: '探索创作', icon: Sparkles, shortcut: 'Alt+5' },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    setMobileMenuOpen(false);
    onTabChange(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-hub-bg/90 border-b border-hub-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => handleTabClick('workbench')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-hub-gold/40 shadow-sm group-hover:border-hub-gold transition-colors flex-shrink-0">
            <img 
              src="./eugene-logo.jpg" 
              alt="Eugene Finance Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-hub-gold/20 to-transparent pointer-events-none" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold tracking-wide text-sm sm:text-base text-slate-100 group-hover:text-hub-goldLight transition-colors">
                Eugene Finance
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-hub-gold/10 text-hub-gold border border-hub-gold/20 font-medium">
                Hub
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans tracking-wide hidden sm:inline">
              研究与决策工作台
            </span>
          </div>
        </div>

        {/* View Switcher Tabs (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 p-1 bg-hub-card/80 border border-hub-border rounded-xl">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-hub-panel text-hub-gold border border-hub-gold/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-hub-panel/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-hub-gold' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-hub-panel/80 hover:bg-hub-panel border border-hub-border hover:border-hub-borderHover text-slate-300 text-xs transition-all shadow-inner group"
            title="搜索 (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-hub-gold transition-colors" />
            <span className="hidden sm:inline text-slate-400">搜索...</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.2 rounded bg-hub-bg border border-hub-border text-slate-400 group-hover:text-hub-gold">
              Ctrl K
            </kbd>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-hub-panel/80 hover:bg-hub-panel border border-hub-border hover:border-hub-gold/40 text-slate-300 text-xs transition-colors"
            title={theme === 'dark' ? '切换为刊物暖纸 (Editorial Paper) 阅读模式' : '切换为曜石暗色 (Obsidian Dark) 模式'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-hub-gold" />
                <span className="hidden xl:inline text-[11px] font-mono text-slate-400">暖纸</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden xl:inline text-[11px] font-mono text-slate-600">暗色</span>
              </>
            )}
          </button>

          {/* EF Lab external link */}
          <a
            href="https://eugenefinance.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-hub-tealLight hover:bg-hub-panel/40 transition-colors"
            title="打开理论实验主站"
          >
            <span>EF Lab</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-hub-panel border border-hub-border text-slate-300 hover:text-white"
            aria-label="切换菜单"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-hub-border bg-hub-bg/95 px-4 pt-2 pb-4 space-y-1.5 backdrop-blur-lg animate-in fade-in duration-150">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-hub-panel text-hub-gold border border-hub-gold/30'
                    : 'text-slate-300 hover:bg-hub-panel/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-hub-gold' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-hub-border/60">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-hub-panel text-slate-300 text-sm"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-hub-gold" />
                <span>搜索全局工具与方法</span>
              </span>
              <span className="font-mono text-xs text-slate-400">Ctrl+K</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
