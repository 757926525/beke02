import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { BlogView } from './components/BlogView';
import { BookshelfView } from './components/BookshelfView';
import { ShopView } from './components/ShopView';
import { GalleryView } from './components/GalleryView';
import { MediaView } from './components/MediaView';
import { AIView } from './components/AIView';
import { CloudDriveView } from './components/CloudDriveView';
import { HistoryManagerView } from './components/HistoryManagerView';
import { AdminView } from './components/AdminView';
import { WriteModal } from './components/WriteModal';
import { ReadModal } from './components/ReadModal';
import { AuthModal } from './components/AuthModal';
import {
  Post,
  Book,
  Product,
  Order,
  CloudFile,
  HistoryItem,
  HeroConfig,
  SystemSettings,
  NavTab,
  User
} from './types';
import { api, setAuthSession, clearAuthSession, getAuthSession } from './api';
import { BookOpen, Bookmark, ShoppingBag, HardDrive, Clock, Settings, PenSquare } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('blog');
  const [loading, setLoading] = useState<boolean>(true);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<'desktop' | 'mobile'>('desktop');

  // Current session user (Admin by default on start or guest/registered)
  const initialAuth = getAuthSession();
  const [currentUser, setCurrentUser] = useState<User | null>(
    initialAuth.role !== 'guest' ? {
      id: initialAuth.userId,
      username: initialAuth.userName,
      role: initialAuth.role as 'admin' | 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      createdAt: '2025-01-01',
    } : null
  );

  // Core dynamic states (Zero localStorage, fully server-synced)
  const [hero, setHero] = useState<HeroConfig>({
    tag: '灵狐逸仙 · 随心而述 · 碧水蓝天',
    title: '现代敏捷多云博客与云端个人空间',
    description: '原生适配多云边缘生态（Cloudflare D1 / R2 / KV / Workers AI 与 阿里云 / 腾讯云），优雅蓝白视界，轻量高效。',
    bannerImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    storageUsed: 0,
    storageTotal: 0,
  });

  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'fox · 现代多云数字空间',
    authorName: 'fox (站长)',
    subtitle: '现代蓝白纯净美学 · 手机/电脑自适应 · 云边协同',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    headerBrand: 'fox',
    aiModel: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    aiApiKey: '',
    aiBaseUrl: 'https://api.deepseek.com/v1',
    aiSystemPrompt: '你是由 fox 博客驱动的高级智能架构师与代码工匠。请提供符合微软工程标准与清晰逻辑的解答。',
    themeColor: '#0284c7',
    themeLayout: 'default',
    d1Enabled: false,
    r2BucketName: '',
    webdavUrl: '',
    webdavConfig: {
      serverUrl: 'https://dav.jianguoyun.com/dav/',
      username: 'foxuser@outlook.com',
      password: '',
      remotePath: '/fox2_backup',
    },
    cfBindings: {
      d1Bound: false,
      d1DatabaseName: '',
      r2Bound: false,
      r2BucketName: '',
      kvBound: false,
      kvNamespace: '',
      aiBound: false,
      aiModelName: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    },
    requireEmailRegistration: false,
    hideNonBlogForGuests: false,
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Modals
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [readingPost, setReadingPost] = useState<Post | null>(null);

  // Initial load from server
  const loadInitialData = async () => {
    try {
      const [h, s, p, b, prods, ords, fls, hist] = await Promise.all([
        api.getHero(),
        api.getSettings().catch(() => settings),
        api.getPosts().catch(() => []),
        api.getBooks().catch(() => []),
        api.getProducts().catch(() => []),
        api.getOrders().catch(() => []),
        api.getFiles().catch(() => []),
        api.getHistory().catch(() => []),
      ]);

      if (h) setHero(h);
      if (s) setSettings(s);
      if (p) setPosts(p);
      if (b) setBooks(b);
      if (prods) setProducts(prods);
      if (ords) setOrders(ords);
      if (fls) setFiles(fls);
      if (hist) setHistory(hist);
    } catch (err) {
      console.warn('Initial data load completed with fallbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    if (activeTab === 'admin' || activeTab === 'cloud') {
      setActiveTab('blog');
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAuthSession(user.role, user.id, user.username);
    loadInitialData();
  };

  // Handlers for Posts
  const handleSelectPost = async (post: Post) => {
    setReadingPost(post);
    try {
      const updatedPost = await api.getPost(post.id);
      setReadingPost(updatedPost);
      setPosts(prev => prev.map(p => (p.id === post.id ? updatedPost : p)));
      const newHist = await api.addHistory({
        title: post.title,
        category: post.category,
        postId: post.id,
      });
      setHistory(prev => [newHist, ...prev.filter(h => h.postId !== post.id)].slice(0, 20));
    } catch (e) {
      console.warn('Failed to sync history to server', e);
    }
  };

  const handleLikePost = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await api.likePost(id);
      setPosts(prev => prev.map(p => (p.id === id ? updated : p)));
      if (readingPost && readingPost.id === id) {
        setReadingPost(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookmarkPost = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await api.bookmarkPost(id);
      setPosts(prev => prev.map(p => (p.id === id ? updated : p)));
      if (readingPost && readingPost.id === id) {
        setReadingPost(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePost = async (postData: Partial<Post>) => {
    const created = await api.createPost(postData);
    setPosts(prev => [created, ...prev]);
  };

  const handleDeletePost = async (id: string) => {
    try {
      await api.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      if (readingPost?.id === id) setReadingPost(null);
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await api.deleteHistoryItem(id);
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleClearHistory = async () => {
    await api.clearHistory();
    setHistory([]);
  };

  const handleUpdateBookProgress = async (bookId: string, page: number) => {
    const updated = await api.updateBookProgress(bookId, page);
    setBooks(prev => prev.map(b => (b.id === bookId ? updated : b)));
  };

  const handlePlaceOrder = async (orderData: any) => {
    const newOrder = await api.createOrder(orderData);
    setOrders(prev => [newOrder, ...prev]);
    const prods = await api.getProducts();
    setProducts(prods);
  };

  const handleUploadFile = async (file: File) => {
    const uploaded = await api.uploadFile(file);
    setFiles(prev => [uploaded, ...prev]);
    const h = await api.getHero();
    setHero(h);
  };

  const handleDeleteFile = async (id: string) => {
    await api.deleteFile(id);
    setFiles(prev => prev.filter(f => f.id !== id));
    const h = await api.getHero();
    setHero(h);
  };

  const handleBatchDeleteFiles = async (ids: string[]) => {
    await api.batchDeleteFiles(ids);
    setFiles(prev => prev.filter(f => !ids.includes(f.id)));
    const h = await api.getHero();
    setHero(h);
  };

  const handleUpdateSettings = async (newSettings: Partial<SystemSettings>) => {
    const s = await api.updateSettings(newSettings);
    setSettings(s);
  };

  const handleUpdateHero = async (newHero: Partial<HeroConfig>) => {
    const h = await api.updateHero(newHero);
    setHero(h);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className={`min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-sky-600 selection:text-white ${
      layoutMode === 'mobile' ? 'max-w-md mx-auto shadow-2xl border-x border-slate-200' : ''
    }`}>
      {/* Navigation Ribbon with Blue Theme & Desktop/Mobile Switcher */}
      <Navbar
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        onOpenWriteModal={() => setWriteModalOpen(true)}
        headerBrand={settings.headerBrand || 'fox'}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        isCollapsed={isHeaderCollapsed}
        onToggleCollapse={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
        layoutMode={layoutMode}
        onToggleLayoutMode={() => setLayoutMode(layoutMode === 'desktop' ? 'mobile' : 'desktop')}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 ${
        layoutMode === 'mobile'
          ? 'max-w-md pb-24'
          : (settings.themeLayout === 'wide' ? 'max-w-[1600px]' : (settings.themeLayout === 'compact' ? 'max-w-5xl' : 'max-w-7xl'))
      }`}>
        {/* Hero banner shown on main exploration tabs */}
        {(activeTab === 'blog' || activeTab === 'books' || activeTab === 'shop') && (
          <HeroBanner
            hero={hero}
            isAdmin={isAdmin}
            onUpdateHero={handleUpdateHero}
          />
        )}

        {/* Tab views */}
        {activeTab === 'blog' && (
          <BlogView
            posts={posts}
            history={history}
            currentUser={currentUser}
            onSelectPost={handleSelectPost}
            onLikePost={handleLikePost}
            onBookmarkPost={handleBookmarkPost}
            onClearHistory={handleClearHistory}
            onDeletePost={handleDeletePost}
          />
        )}

        {activeTab === 'books' && (
          <BookshelfView
            books={books}
            isAdmin={isAdmin}
            onUpdateProgress={handleUpdateBookProgress}
            onRefresh={loadInitialData}
          />
        )}

        {activeTab === 'shop' && (
          <ShopView
            products={products}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {activeTab === 'gallery' && <GalleryView isAdmin={isAdmin} />}

        {activeTab === 'media' && <MediaView isAdmin={isAdmin} />}

        {activeTab === 'ai' && <AIView />}

        {activeTab === 'cloud' && (
          <CloudDriveView
            files={files}
            storageUsed={hero.storageUsed}
            storageTotal={hero.storageTotal}
            isAdmin={isAdmin}
            onUploadFile={handleUploadFile}
            onDeleteFile={handleDeleteFile}
            onBatchDelete={handleBatchDeleteFiles}
          />
        )}

        {activeTab === 'history' && (
          <HistoryManagerView
            history={history}
            posts={posts}
            onSelectPost={handleSelectPost}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
            storageType={settings.d1Enabled ? 'kv' : 'db'}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            settings={settings}
            hero={hero}
            onUpdateSettings={handleUpdateSettings}
            onUpdateHero={handleUpdateHero}
            onRefreshAll={loadInitialData}
          />
        )}
      </main>

      {/* Modals */}
      <WriteModal
        isOpen={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      <ReadModal
        post={readingPost}
        onClose={() => setReadingPost(null)}
        onLike={id => handleLikePost(id)}
        onBookmark={id => handleBookmarkPost(id)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Mobile Floating Bottom Navigation Bar (Active in mobile layout or small viewports) */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 py-2 px-3 flex items-center justify-around shadow-lg ${
        layoutMode === 'mobile' ? 'max-w-md mx-auto' : 'md:hidden'
      }`}>
        <button
          onClick={() => setActiveTab('blog')}
          className={`flex flex-col items-center text-[10px] ${activeTab === 'blog' ? 'text-sky-600 font-bold' : 'text-slate-500'}`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>博客</span>
        </button>
        <button
          onClick={() => setActiveTab('books')}
          className={`flex flex-col items-center text-[10px] ${activeTab === 'books' ? 'text-sky-600 font-bold' : 'text-slate-500'}`}
        >
          <Bookmark className="w-4 h-4 mb-0.5" />
          <span>书架</span>
        </button>
        {currentUser && (
          <button
            onClick={() => setWriteModalOpen(true)}
            className="flex flex-col items-center text-[10px] text-white -mt-4"
          >
            <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center shadow-md active:scale-95 transition">
              <PenSquare className="w-5 h-5" />
            </div>
            <span className="text-sky-700 font-semibold mt-0.5">发文</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex flex-col items-center text-[10px] ${activeTab === 'shop' ? 'text-sky-600 font-bold' : 'text-slate-500'}`}
        >
          <ShoppingBag className="w-4 h-4 mb-0.5" />
          <span>文创</span>
        </button>
        {isAdmin ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center text-[10px] ${activeTab === 'admin' ? 'text-sky-600 font-bold' : 'text-slate-500'}`}
          >
            <Settings className="w-4 h-4 mb-0.5" />
            <span>管理</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center text-[10px] ${activeTab === 'history' ? 'text-sky-600 font-bold' : 'text-slate-500'}`}
          >
            <Clock className="w-4 h-4 mb-0.5" />
            <span>足迹</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-sky-900/10 bg-white/80 py-6 text-xs text-slate-500 mb-12 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">{settings.headerBrand || 'fox'} · 现代多云博客</span>
            <span>© 2025 青丘夜雪 · 保留所有权利</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>现代优雅蓝白风格 (Sky Azure & Crisp White)</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
              Zero LocalStorage
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
