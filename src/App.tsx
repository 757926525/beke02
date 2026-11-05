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
import { AdminView } from './components/AdminView';
import { WriteModal } from './components/WriteModal';
import { ReadModal } from './components/ReadModal';
import {
  Post,
  Book,
  Product,
  Order,
  CloudFile,
  HistoryItem,
  HeroConfig,
  SystemSettings,
  NavTab
} from './types';
import { api } from './api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('blog');
  const [loading, setLoading] = useState<boolean>(true);

  // Core dynamic states (Zero localStorage, fully server-synced)
  const [hero, setHero] = useState<HeroConfig>({
    tag: '灵狐踏雪 · 随心而述 · 云端无界',
    title: '极简敏捷与多云边缘博客',
    description: '原生适配多云边缘 Pages（Cloudflare / 腾讯云 / 阿里云），一键拉取与构建，集成 D1 边缘数据库与全功能媒体中枢。',
    bannerImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    storageUsed: 81.6,
    storageTotal: 10240,
  });

  const [settings, setSettings] = useState<SystemSettings>({
    siteName: '白狐博客 - WhiteFox Blog',
    authorName: 'fox (站长)',
    subtitle: '优雅多云架构 · 白狐极简数字空间',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    aiModel: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    aiApiKey: '',
    aiBaseUrl: 'https://api.deepseek.com/v1',
    aiSystemPrompt: '你是由白狐博客驱动的专家级智能编程与技术架构顾问。',
    themeColor: '#f43f5e',
    d1Enabled: true,
    r2BucketName: 'fox-blog-assets',
    webdavUrl: 'https://dav.jianguoyun.com/dav/',
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

  // Handlers for Posts
  const handleSelectPost = async (post: Post) => {
    setReadingPost(post);
    // Persist history & read count on server
    try {
      const updatedPost = await api.getPost(post.id);
      setReadingPost(updatedPost);
      // update local posts list
      setPosts(prev => prev.map(p => (p.id === post.id ? updatedPost : p)));
      // record history
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

  const handleClearHistory = async () => {
    await api.clearHistory();
    setHistory([]);
  };

  // Handlers for Bookshelf
  const handleUpdateBookProgress = async (bookId: string, page: number) => {
    const updated = await api.updateBookProgress(bookId, page);
    setBooks(prev => prev.map(b => (b.id === bookId ? updated : b)));
  };

  // Handlers for Shop & Orders
  const handlePlaceOrder = async (orderData: any) => {
    const newOrder = await api.createOrder(orderData);
    setOrders(prev => [newOrder, ...prev]);
    // refresh products stock
    const prods = await api.getProducts();
    setProducts(prods);
  };

  // Handlers for Cloud Files
  const handleUploadFile = async (file: File) => {
    const uploaded = await api.uploadFile(file);
    setFiles(prev => [uploaded, ...prev]);
    // refresh hero storage
    const h = await api.getHero();
    setHero(h);
  };

  const handleDeleteFile = async (id: string) => {
    await api.deleteFile(id);
    setFiles(prev => prev.filter(f => f.id !== id));
    const h = await api.getHero();
    setHero(h);
  };

  // Handlers for Admin
  const handleUpdateSettings = async (newSettings: Partial<SystemSettings>) => {
    const s = await api.updateSettings(newSettings);
    setSettings(s);
  };

  const handleUpdateHero = async (newHero: Partial<HeroConfig>) => {
    const h = await api.updateHero(newHero);
    setHero(h);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        onOpenWriteModal={() => setWriteModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero banner shown on main tabs */}
        {(activeTab === 'blog' || activeTab === 'books' || activeTab === 'shop') && (
          <HeroBanner hero={hero} />
        )}

        {/* Tab router views */}
        {activeTab === 'blog' && (
          <BlogView
            posts={posts}
            history={history}
            onSelectPost={handleSelectPost}
            onLikePost={handleLikePost}
            onBookmarkPost={handleBookmarkPost}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'books' && (
          <BookshelfView
            books={books}
            onUpdateProgress={handleUpdateBookProgress}
          />
        )}

        {activeTab === 'shop' && (
          <ShopView
            products={products}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {activeTab === 'gallery' && <GalleryView />}

        {activeTab === 'media' && <MediaView />}

        {activeTab === 'ai' && <AIView />}

        {activeTab === 'cloud' && (
          <CloudDriveView
            files={files}
            storageUsed={hero.storageUsed}
            storageTotal={hero.storageTotal}
            onUploadFile={handleUploadFile}
            onDeleteFile={handleDeleteFile}
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

      {/* Footer */}
      <footer className="mt-auto border-t border-rose-100/80 bg-white/70 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">fox2 · 白狐博客</span>
            <span>© 2025 青丘夜雪 · 保留所有权利</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>多云边缘驱动 (Cloudflare / 腾讯云 / 阿里云 / Vercel)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-200">
              Zero LocalStorage
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
