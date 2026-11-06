import React, { useState } from 'react';
import {
  BookOpen,
  Bookmark,
  ShoppingBag,
  Camera,
  Film,
  Cpu,
  HardDrive,
  Clock,
  Settings,
  PenSquare,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Bell,
  User,
  LogOut,
  LogIn
} from 'lucide-react';
import { NavTab, User as UserType } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenWriteModal: () => void;
  headerBrand: string;
  currentUser: UserType | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasUnreadMessages?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenWriteModal,
  headerBrand = 'fox',
  currentUser,
  onOpenAuthModal,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  hasUnreadMessages = false,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isGuest = !currentUser;

  const navItems = [
    { id: 'blog' as NavTab, label: '博客文章', icon: BookOpen, show: true },
    { id: 'books' as NavTab, label: '书架', icon: Bookmark, show: true },
    { id: 'shop' as NavTab, label: '甄选文创', icon: ShoppingBag, show: true },
    { id: 'gallery' as NavTab, label: '光影视界', icon: Camera, show: true },
    { id: 'media' as NavTab, label: '媒体影音', icon: Film, show: true },
    { id: 'ai' as NavTab, label: '编程 AI', icon: Cpu, badge: '智能', show: true },
    // Cloud drive strictly hidden for non-admins
    { id: 'cloud' as NavTab, label: '网盘与 WebDAV', icon: HardDrive, show: isAdmin },
    { id: 'history' as NavTab, label: '足迹历程', icon: Clock, show: true },
    // Admin tab strictly visible for admin only
    { id: 'admin' as NavTab, label: '系统管理设置', icon: Settings, show: isAdmin },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs transition-all duration-300">
      {/* Top Outlook Style Header Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand & Status Ribbon */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onTabChange('blog')}
              className="flex items-center space-x-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:bg-emerald-700 transition">
                <span className="font-black text-lg tracking-wider">🦊</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-800 tracking-tight flex items-center gap-1.5">
                  {headerBrand || 'fox'}
                </span>
                <span className="text-[11px] text-emerald-800 font-medium">青丘夜雪 · 绿白数字视界</span>
              </div>
            </button>

            {/* Changed from fox2 边缘云 to 站内消息状态灯 */}
            <div
              title={hasUnreadMessages ? "有新的系统与站内回复消息" : "站内消息与通信通道畅通"}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition ${
                hasUnreadMessages
                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
              onClick={() => {
                if (isAdmin) onTabChange('admin');
              }}
            >
              <span className={`w-2 h-2 rounded-full ${hasUnreadMessages ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <Bell className="w-3 h-3 text-emerald-600" />
              <span>{hasUnreadMessages ? '有新消息' : '站内消息状态灯: 畅通'}</span>
            </div>
          </div>

          {/* Right Header Controls: Write / Login / User profile / Collapse Toggle */}
          <div className="flex items-center space-x-2.5">
            {/* Write Button (Hidden for guests) */}
            {!isGuest && (
              <button
                onClick={onOpenWriteModal}
                className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 text-white font-medium text-xs shadow-xs hover:bg-emerald-700 active:scale-95 transition"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>发表文章</span>
              </button>
            )}

            {/* User status & Auth */}
            {currentUser ? (
              <div className="flex items-center space-x-2 border-l border-emerald-100 pl-3">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.username}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-300"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-700 leading-tight">
                    {currentUser.username}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium leading-none">
                    {currentUser.role === 'admin' ? '唯一站长' : '注册用户'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="退出登录"
                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-medium transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>登录 / 注册</span>
              </button>
            )}

            {/* Header Collapse / Expand Toggle Button */}
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? "展开完整导航栏" : "收拢导航栏以沉浸阅读"}
              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Nav Tab Bar (Collapsible) */}
      {!isCollapsed && (
        <div className="border-t border-emerald-50 bg-[#fafcfb] transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar">
              {navItems.filter(item => item.show).map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
