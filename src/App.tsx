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
import { api, setAuthSession, getAuthSession } from './api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('blog');
  const [loading, setLoading] = useState<boolean>(true);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Current session user (Admin by default on start or guest/registered)
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'user-admin',
    username: 'admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: '2025-01-01',
  });

  // Core dynamic states (Zero localStorage, fully server-synced)
  const [hero, setHero] = useState<HeroConfig>({
    tag: '灵狐踏雪 · 随心而述 · 碧玉长空',
    title: '现代敏捷多云博客与云端个人空间',
    description: '原生适配多云边缘生态（Cloudflare D1 / R2 / KV / Workers AI 与 阿里云 / 腾讯云），优雅绿白视界，轻量高效。',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    storageUsed: 0,
    storageTotal: 0,
  });

  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'fox · 现代多云数字空间',
    authorName: 'fox (站长)',
    subtitle: '微软 Outlook 灵感优雅绿白美学 · 云边协同',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    headerBrand: 'fox',
    aiModel: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    aiApiKey: '',
    aiBaseUrl: 'https://api.deepseek.com/v1',
    aiSystemPrompt: '你是由 fox 博客驱动的高级智能架构师与代码工匠。请提供符合微软工程标准与清晰逻辑的解答。',
    themeColor: '#059669',
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
    setAuthSession('guest', 'guest', '访客');
    setCurrentUser(null);
    if (activeTab === 'admin' || activeTab === 'cloud') {
      setActiveTab('blog');
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
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
    <div className="min-h-screen bg-[#f4f7f6] text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Navigation Ribbon (Outlook Style) */}
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
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 ${
        settings.themeLayout === 'wide' ? 'max-w-[1600px]' : (settings.themeLayout === 'compact' ? 'max-w-5xl' : 'max-w-7xl')
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

      {/* Footer */}
      <footer className="mt-auto border-t border-emerald-900/10 bg-white/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">{settings.headerBrand || 'fox'} · 现代多云博客</span>
            <span>© 2025 青丘夜雪 · 保留所有权利</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>微软 Outlook 绿白风格 (Emerald & White)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Zero LocalStorage
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
