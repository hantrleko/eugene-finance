import React, { useState } from 'react';
import { Search, Compass, BookOpen, Layers, Sparkles, Menu, X, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'workbench', label: '工作台', icon: Compass, href: '#workbench' },
    { id: 'playbooks', label: '研究路径', icon: BookOpen, href: '#playbooks' },
    { id: 'catalog', label: '全部模块', icon: Layers, href: '#catalog' },
    { id: 'exploration', label: '探索与创作', icon: Sparkles, href: '#exploration' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-hub-bg/85 border-b border-hub-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <a href="#workbench" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-hub-gold/40 shadow-sm group-hover:border-hub-gold transition-colors flex-shrink-0">
            <img 
              src="./eugene-logo.jpg" 
              alt="Eugene Finance Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback icon if logo not loaded
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-hub-gold/20 to-transparent pointer-events-none" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-wider text-base text-slate-100 group-hover:text-hub-goldLight transition-colors">
                Eugene Finance
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-hub-gold/10 text-hub-gold border border-hub-gold/20 font-medium">
                Hub
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans tracking-wide">
              研究与决策工作台
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-hub-panel text-hub-gold border border-hub-gold/30 shadow-sm'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-hub-panel/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-hub-gold' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-hub-panel/80 hover:bg-hub-panel border border-hub-border hover:border-hub-borderHover text-slate-300 text-xs transition-all shadow-inner group"
            title="点击或按 Ctrl+K 打开全局搜索"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-hub-gold transition-colors" />
            <span className="hidden sm:inline text-slate-400">搜索项目、方法...</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-hub-bg border border-hub-border text-slate-400 group-hover:border-hub-gold/40 group-hover:text-hub-gold transition-colors">
              Ctrl K
            </kbd>
          </button>

          {/* EF Lab external quickjump */}
          <a
            href="https://eugenefinance.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-hub-tealLight hover:bg-hub-panel/40 transition-colors"
            title="打开理论实验独立站点"
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-hub-border bg-hub-bg/95 px-4 pt-2 pb-4 space-y-1 backdrop-blur-lg animate-in fade-in duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-hub-panel text-hub-gold border border-hub-gold/30'
                    : 'text-slate-300 hover:bg-hub-panel/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-hub-gold' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </a>
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
                <span>搜索全局项目与方法</span>
              </span>
              <span className="font-mono text-xs text-slate-400">Ctrl+K</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
