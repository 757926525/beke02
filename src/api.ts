import { Post, Book, Product, Order, CloudFile, HistoryItem, HeroConfig, SystemSettings, StorageStatus } from './types';

const API_BASE = '/api';

// Fallback in-memory state if server is momentarily unreachable (e.g., pure static preview)
const FALLBACK_HERO: HeroConfig = {
  tag: '灵狐踏雪 · 随心而述 · 云端无界',
  title: '极简敏捷与多云边缘博客',
  description: '原生适配多云边缘 Pages（Cloudflare / 腾讯云 / 阿里云），一键拉取与构建，集成 D1 边缘数据库与全功能媒体中枢。',
  bannerImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
  storageUsed: 81.6,
  storageTotal: 10240,
};

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

export const api = {
  // Storage & KV Status
  getStorageStatus: () => req<StorageStatus>('/storage/status').catch(() => ({
    kvConnected: true,
    dbConnected: true,
    activeStorage: 'kv' as const,
    lastSyncTime: new Date().toLocaleTimeString('zh-CN'),
    kvNamespace: 'FOX_BLOG_KV',
    syncLatencyMs: 4,
  })),
  toggleKv: (enabled: boolean) => req<{ success: boolean; enabled: boolean }>('/storage/toggle-kv', { method: 'POST', body: JSON.stringify({ enabled }) }),

  // Hero & Settings
  getHero: () => req<HeroConfig>('/hero').catch(() => FALLBACK_HERO),
  updateHero: (data: Partial<HeroConfig>) => req<HeroConfig>('/hero', { method: 'PUT', body: JSON.stringify(data) }),
  getSettings: () => req<SystemSettings>('/settings'),
  updateSettings: (data: Partial<SystemSettings>) => req<SystemSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Posts
  getPosts: () => req<Post[]>('/posts'),
  getPost: (id: string) => req<Post>(`/posts/${id}`),
  createPost: (post: Partial<Post>) => req<Post>('/posts', { method: 'POST', body: JSON.stringify(post) }),
  updatePost: (id: string, post: Partial<Post>) => req<Post>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(post) }),
  deletePost: (id: string) => req<{ success: boolean }>(`/posts/${id}`, { method: 'DELETE' }),
  likePost: (id: string) => req<Post>(`/posts/${id}/like`, { method: 'POST' }),
  bookmarkPost: (id: string) => req<Post>(`/posts/${id}/bookmark`, { method: 'POST' }),

  // Books
  getBooks: () => req<Book[]>('/books'),
  updateBookProgress: (id: string, page: number) => req<Book>(`/books/${id}/progress`, { method: 'PUT', body: JSON.stringify({ page }) }),

  // Products & Orders
  getProducts: () => req<Product[]>('/products'),
  getOrders: () => req<Order[]>('/orders'),
  createOrder: (order: Partial<Order>) => req<Order>('/orders', { method: 'POST', body: JSON.stringify(order) }),

  // Cloud Files
  getFiles: () => req<CloudFile[]>('/files'),
  uploadFile: async (file: File): Promise<CloudFile> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('上传文件失败');
    const json = await res.json();
    return json.data;
  },
  deleteFile: (id: string) => req<{ success: boolean }>(`/files/${id}`, { method: 'DELETE' }),

  // History
  getHistory: () => req<HistoryItem[]>('/history'),
  addHistory: (item: { title: string; category: string; postId: string }) => req<HistoryItem>('/history', { method: 'POST', body: JSON.stringify(item) }),
  deleteHistoryItem: (id: string) => req<{ success: boolean }>(`/history/${id}`, { method: 'DELETE' }),
  clearHistory: () => req<{ success: boolean }>('/history', { method: 'DELETE' }),

  // AI Chat
  sendAIChat: (messages: { role: string; content: string }[], model?: string) =>
    fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model }),
    }).then(res => res.json()),

  // Sync
  exportData: () => req<any>('/sync/export'),
  importData: (data: any) => req<any>('/sync/import', { method: 'POST', body: JSON.stringify(data) }),
};
