import React, { useState } from 'react';
import {
  BookOpen,
  Library,
  ShoppingBag,
  Camera,
  Music,
  Cpu,
  HardDrive,
  Settings,
  PenLine,
  ExternalLink,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { NavTab } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenWriteModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenWriteModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'blog', label: '博客文章', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'books', label: '书架', icon: <Library className="w-4 h-4" /> },
    { id: 'shop', label: '甄选文创商城', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'gallery', label: '光影视界', icon: <Camera className="w-4 h-4" /> },
    { id: 'media', label: '媒体影音', icon: <Music className="w-4 h-4" /> },
    { id: 'ai', label: '编程AI', icon: <Cpu className="w-4 h-4" /> },
    { id: 'cloud', label: '网盘与 WebDAV', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'history', label: '足迹历程', icon: <Clock className="w-4 h-4" /> },
    { id: 'admin', label: '系统管理设置', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('blog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-rose-200">
              <span className="text-xl">🦊</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">WhiteFox</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium border border-rose-200/60">fox2 边缘云</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">青丘夜雪 · 白狐极简数字空间</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-rose-50 text-rose-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-rose-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: Write & External Links */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={onOpenWriteModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-all shadow-emerald-200 active:scale-95"
            >
              <PenLine className="w-4 h-4" />
              <span>发表文章</span>
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="GitHub 仓库"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={onOpenWriteModal}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium"
            >
              写文
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-rose-50 text-rose-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
