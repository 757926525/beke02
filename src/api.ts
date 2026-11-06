import {
  Post,
  Book,
  Product,
  Order,
  CloudFile,
  HistoryItem,
  HeroConfig,
  SystemSettings,
  StorageStatus,
  User,
  GalleryItem,
  MediaTrack
} from './types';

// In-memory auth state (Zero localStorage!)
let currentAuthRole: 'admin' | 'user' | 'guest' = 'admin'; // Default developer session can be switched
let currentUserId = 'user-admin';
let currentUserName = 'fox (站长)';

export const setAuthSession = (role: 'admin' | 'user' | 'guest', id: string, name: string) => {
  currentAuthRole = role;
  currentUserId = id;
  currentUserName = name;
};

export const getAuthSession = () => ({
  role: currentAuthRole,
  userId: currentUserId,
  userName: currentUserName,
});

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('x-user-role', currentAuthRole);
  headers.set('x-user-id', currentUserId);
  headers.set('x-user-name', encodeURIComponent(currentUserName));

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!json.success && json.message) {
    throw new Error(json.message);
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ success: boolean; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, email?: string) =>
    request<{ success: boolean; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email }),
    }),

  getUsers: () => request<User[]>('/users'),
  deleteUser: (id: string) => request<boolean>(`/users/${id}`, { method: 'DELETE' }),

  // Storage Status
  getStorageStatus: () => request<StorageStatus>('/storage/status'),

  // Hero & Settings
  getHero: () => request<HeroConfig>('/hero'),
  updateHero: (hero: Partial<HeroConfig>) =>
    request<HeroConfig>('/hero', {
      method: 'PUT',
      body: JSON.stringify(hero),
    }),

  getSettings: () => request<SystemSettings>('/settings'),
  updateSettings: (settings: Partial<SystemSettings>) =>
    request<SystemSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Posts
  getPosts: () => request<Post[]>('/posts'),
  getPost: (id: string) => request<Post>(`/posts/${id}`),
  createPost: (post: Partial<Post>) =>
    request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    }),
  updatePost: (id: string, post: Partial<Post>) =>
    request<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    }),
  deletePost: (id: string) =>
    request<boolean>(`/posts/${id}`, { method: 'DELETE' }),
  likePost: (id: string) =>
    request<Post>(`/posts/${id}/like`, { method: 'POST' }),
  bookmarkPost: (id: string) =>
    request<Post>(`/posts/${id}/bookmark`, { method: 'POST' }),

  // Books
  getBooks: () => request<Book[]>('/books'),
  addBook: (book: Partial<Book>) =>
    request<Book>('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    }),
  updateBookProgress: (id: string, page: number) =>
    request<Book>(`/books/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ page }),
    }),
  deleteBook: (id: string) =>
    request<boolean>(`/books/${id}`, { method: 'DELETE' }),

  // Gallery
  getGallery: () => request<GalleryItem[]>('/gallery'),
  addGalleryItem: (item: Partial<GalleryItem>) =>
    request<GalleryItem>('/gallery', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  deleteGalleryItem: (id: string) =>
    request<boolean>(`/gallery/${id}`, { method: 'DELETE' }),

  // Media
  getMedia: () => request<MediaTrack[]>('/media'),
  addMediaTrack: (track: Partial<MediaTrack>) =>
    request<MediaTrack>('/media', {
      method: 'POST',
      body: JSON.stringify(track),
    }),
  deleteMediaTrack: (id: string) =>
    request<boolean>(`/media/${id}`, { method: 'DELETE' }),

  // Products & Orders
  getProducts: () => request<Product[]>('/products'),
  getOrders: () => request<Order[]>('/orders'),
  createOrder: (order: any) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),

  // Files
  getFiles: () => request<CloudFile[]>('/files'),
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<CloudFile>('/files/upload', {
      method: 'POST',
      body: formData,
    });
  },
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ success: boolean; url: string }>('/upload/image', {
      method: 'POST',
      body: formData,
    });
  },
  deleteFile: (id: string) =>
    request<boolean>(`/files/${id}`, { method: 'DELETE' }),
  batchDeleteFiles: (ids: string[]) =>
    request<{ success: boolean; deletedCount: number }>('/files/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  // WebDAV
  testWebDav: (config: any) =>
    request<{ success: boolean; message: string }>('/webdav/test', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  // History
  getHistory: () => request<HistoryItem[]>('/history'),
  addHistory: (item: { title: string; category: string; postId: string }) =>
    request<HistoryItem>('/history', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  deleteHistoryItem: (id: string) =>
    request<boolean>(`/history/${id}`, { method: 'DELETE' }),
  clearHistory: () => request<{ success: boolean }>('/history', { method: 'DELETE' }),

  // AI
  chatAi: (body: { message?: string; messages?: any[]; model?: string }) =>
    request<{ success: boolean; reply: string; model: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Backup
  exportData: () => request<any>('/sync/export'),
  importData: (data: any) =>
    request<{ success: boolean }>('/sync/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
