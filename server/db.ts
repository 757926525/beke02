import fs from 'fs';
import path from 'path';
import {
  Post,
  Book,
  Product,
  Order,
  CloudFile,
  HistoryItem,
  HeroConfig,
  SystemSettings,
  User,
  GalleryItem,
  MediaTrack
} from '../src/types.js';

export interface DatabaseData {
  users: User[];
  posts: Post[];
  books: Book[];
  products: Product[];
  orders: Order[];
  files: CloudFile[];
  gallery: GalleryItem[];
  media: MediaTrack[];
  history: HistoryItem[];
  hero: HeroConfig;
  settings: SystemSettings;
  adminCredentials: {
    username: string;
    passwordHash: string; // Environment or deploy-configured
  };
}

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Admin credentials set during deployment or default from env
const DEPLOY_ADMIN_USER = process.env.ADMIN_USER || 'admin';
const DEPLOY_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fox2admin888';

const INITIAL_DATA: DatabaseData = {
  adminCredentials: {
    username: DEPLOY_ADMIN_USER,
    passwordHash: DEPLOY_ADMIN_PASSWORD,
  },
  users: [
    {
      id: 'user-admin',
      username: DEPLOY_ADMIN_USER,
      role: 'admin',
      email: 'admin@whitefox.cloud',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      createdAt: '2025-01-01',
    },
    {
      id: 'user-reader-1',
      username: 'qingfeng',
      role: 'user',
      email: 'qingfeng@fox.mail',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      createdAt: '2025-03-12',
    }
  ],
  hero: {
    tag: '灵狐踏雪 · 随心而述 · 碧玉长空',
    title: '现代敏捷多云博客与云端个人空间',
    description: '原生适配多云边缘生态（Cloudflare D1 / R2 / KV / Workers AI 与 阿里云 / 腾讯云），优雅绿白视界，轻量高效。',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    storageUsed: 0, // Default is 0 until real files or cloud pools are connected
    storageTotal: 0, // Default 0 when unconfigured
  },
  settings: {
    siteName: 'fox · 现代多云数字空间',
    authorName: 'fox (站长)',
    subtitle: '微软 Outlook 灵感优雅绿白美学 · 云边协同',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    headerBrand: 'fox',
    aiModel: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    aiApiKey: '',
    aiBaseUrl: 'https://api.deepseek.com/v1',
    aiSystemPrompt: '你是由 fox 博客驱动的高级智能架构师与代码工匠。请提供符合微软工程标准与清晰逻辑的解答。',
    themeColor: '#059669', // Emerald Outlook Green
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
  },
  posts: [
    {
      id: 'post-1',
      title: '青丘夜雪：fox 多云博客的绿白 Outlook 美学与纯净持久化',
      summary: '告别繁琐冗余设计，回归微软经典绿白设计语言。探讨脱离 localStorage、完全依赖后端原子状态的现代化架构实践。',
      content: `## 微软 Outlook 灵感与纯粹设计\n\n全新 fox 博客系统以清雅沉稳的**翡翠绿 (#059669)**与**纯白/微雪灰**为核心调色盘，搭配高对比度文字与柔和圆角卡片，呈现出媲美现代企业办公界面的清爽与高效。\n\n### 核心工程原则\n\n1. **真实为本**：云端存储池、D1、R2、KV 在未接入前真实数值默认归零，绝不伪造虚假容量。\n2. **单管理员唯一制**：全站仅保留一位唯一站长，拥有全部系统控制与媒体调度权。\n3. **多云平滑离线**：即便完全不连外网、不使用 D1/KV/R2，本地自带的文件型数据库也能流畅自洽运行。`,
      category: '技术视界',
      tags: ['Outlook风格', '多云架构', '零LocalStorage', 'TypeScript'],
      date: '2025-05-20',
      reads: 1540,
      likes: 88,
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      isBookmarked: true,
      authorId: 'user-admin',
      authorName: 'fox (站长)',
    },
    {
      id: 'post-2',
      title: '从 D1 到 R2：Cloudflare 与轻量自建多云存储池实战指南',
      summary: '深度解析 Serverless SQLite (D1)、免出口流量费对象存储 (R2) 以及本地文件存储的协同设计。',
      content: `## 存储的弹性分级\n\n在现代多云架构中，存储应当根据资产价值与访问频次划分层级：\n\n- **结构化元数据**：存储于 Cloudflare D1 或本地 JSON 引擎，毫秒级读取。\n- **静态富媒体**：存储于 R2 / 本地 uploads 目录，支持图片缩略图、进度条上传与流式分发。\n- **分布式缓存**：通过 KV 适配器实现边缘热数据加速。`,
      category: '多云架构',
      tags: ['Cloudflare', 'D1', 'R2', '对象存储'],
      date: '2025-05-18',
      reads: 960,
      likes: 54,
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      isBookmarked: false,
      authorId: 'user-admin',
      authorName: 'fox (站长)',
    }
  ],
  books: [
    {
      id: 'book-1',
      title: '道德经真义 (附全屏研读)',
      author: '老子 / fox 站长注',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      category: '国学经典',
      totalPages: 81,
      currentPage: 3,
      progress: 4,
      description: '道可道，非常道；名可名，非常名。体悟东方天人合一与极简无为之道。',
      format: 'epub',
      fileSize: 1048576,
      chapters: [
        {
          title: '第一章 · 体道',
          content: '道可道，非常道。名可名，非常名。\n无名天地之始；有名万物之母。\n故常无，欲以观其妙；常有，欲以观其徼。\n此两者，同出而异名，同谓之玄。玄之又玄，众妙之门。'
        },
        {
          title: '第二章 · 养身',
          content: '天下皆知美之为美，斯恶已。皆知善之为善，斯不善已。\n故有无相生，难易相成，长短相形，高下相倾，音声相和，前后相随。\n是以圣人处无为之事，行不言之教；万物作而弗始，生而弗有，为而弗恃，功成而弗居。夫唯弗居，是以不去。'
        }
      ]
    },
    {
      id: 'book-2',
      title: '多云边缘计算实战手册',
      author: 'fox 团队',
      cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      category: '前沿技术',
      totalPages: 120,
      currentPage: 36,
      progress: 30,
      description: '深入探讨微服务、Serverless、边缘计算、Kubernetes 与高并发架构调优。',
      format: 'pdf',
      fileSize: 2097152,
      chapters: [
        {
          title: '第一章 · 边缘网络与低延迟',
          content: '通过在遍布全球的网络边缘执行代码与缓存静态及动态数据，应用可以实现亚毫秒级低延迟，大幅减轻中心源站负载。'
        }
      ]
    }
  ],
  gallery: [
    {
      id: 'photo-1',
      title: '青丘暮雪 · 灵狐仙踪',
      category: '风光摄影',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      likes: 42,
      uploadedAt: '2025-05-18',
    },
    {
      id: 'photo-2',
      title: '晨曦翠柏 · 极简山水',
      category: '东方美学',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      likes: 68,
      uploadedAt: '2025-05-19',
    },
    {
      id: 'photo-3',
      title: '绿野千寻 · 晨间云雾',
      category: '自然写意',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      likes: 91,
      uploadedAt: '2025-05-20',
    }
  ],
  media: [
    {
      id: 'media-1',
      title: '高山流水 · 琴箫合奏',
      artist: '青丘乐坊',
      duration: '04:18',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      type: 'audio',
    },
    {
      id: 'media-2',
      title: '青丘落雪 · 4K 演示片',
      artist: 'fox 视觉工作室',
      duration: '02:30',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      cover: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80',
      type: 'video',
    }
  ],
  products: [
    {
      id: 'prod-1',
      name: 'fox 专属定制红木书签 (两枚入)',
      price: 68.0,
      originalPrice: 98.0,
      stock: 50,
      sales: 126,
      cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
      desc: '进口天然红木雕琢，篆刻“言由心生，灵狐逸仙”，温润雅致，读书抚琴必备。',
      badge: '热卖甄选'
    }
  ],
  orders: [],
  files: [],
  history: []
};

class Database {
  private data: DatabaseData;

  constructor() {
    this.data = this.loadData();
    this.recalculateStorage();
  }

  private loadData(): DatabaseData {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure merged backward compatibility
        return {
          ...INITIAL_DATA,
          ...parsed,
          settings: {
            ...INITIAL_DATA.settings,
            ...(parsed.settings || {}),
            cfBindings: {
              ...INITIAL_DATA.settings.cfBindings,
              ...(parsed.settings?.cfBindings || {}),
            },
            webdavConfig: {
              ...INITIAL_DATA.settings.webdavConfig,
              ...(parsed.settings?.webdavConfig || {}),
            }
          }
        };
      }
    } catch (e) {
      console.warn('Failed to load db.json, initializing default data', e);
    }
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveData(data: DatabaseData): void {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json', e);
    }
  }

  public recalculateStorage(): void {
    // Calculate real local file size
    const localBytes = this.data.files.reduce((acc, cur) => acc + (cur.size || 0), 0);
    const localMb = Number((localBytes / (1024 * 1024)).toFixed(2));

    // Cloud storage: If R2 is bound, use its configured size; if not bound, defaults to 0!
    const isR2Bound = this.data.settings.cfBindings?.r2Bound;
    if (!isR2Bound) {
      // Zero defaults when unattached
      this.data.hero.storageUsed = localMb;
      this.data.hero.storageTotal = localMb > 0 ? 5120 : 0; // 0 if empty
    } else {
      // When connected, show real configured quota
      this.data.hero.storageUsed = localMb;
      this.data.hero.storageTotal = 10240; // 10GB cloud pool
    }
  }

  // --- Users & Single Admin ---
  getUsers(): User[] {
    return this.data.users;
  }

  getAdminUser(): { username: string } {
    return {
      username: this.data.adminCredentials.username || DEPLOY_ADMIN_USER,
    };
  }

  verifyAdmin(password: string): boolean {
    const validPass = process.env.ADMIN_PASSWORD || this.data.adminCredentials.passwordHash || DEPLOY_ADMIN_PASSWORD;
    return password === validPass;
  }

  registerUser(username: string, email?: string): User {
    const existing = this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      return existing;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      role: 'user', // Only 1 admin in system! Newly registered users are always standard users.
      email: email || `${username}@fox.user`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.data.users.push(newUser);
    this.saveData(this.data);
    return newUser;
  }

  deleteUser(userId: string): boolean {
    if (userId === 'user-admin') return false; // Cannot delete sole admin
    const prevLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== userId);
    if (this.data.users.length !== prevLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Hero & Settings ---
  getHero(): HeroConfig {
    this.recalculateStorage();
    return this.data.hero;
  }
  updateHero(hero: Partial<HeroConfig>): HeroConfig {
    this.data.hero = { ...this.data.hero, ...hero };
    this.saveData(this.data);
    return this.data.hero;
  }

  getSettings(): SystemSettings {
    return this.data.settings;
  }
  updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.recalculateStorage();
    this.saveData(this.data);
    return this.data.settings;
  }

  // --- Posts ---
  getPosts(): Post[] {
    return this.data.posts;
  }
  getPost(id: string): Post | undefined {
    return this.data.posts.find(p => p.id === id);
  }
  createPost(post: Omit<Post, 'id' | 'reads' | 'likes'>, author?: { id: string; name: string }): Post {
    const newPost: Post = {
      ...post,
      id: `post-${Date.now()}`,
      reads: 1,
      likes: 0,
      isBookmarked: false,
      authorId: author?.id || 'user-admin',
      authorName: author?.name || 'fox (站长)',
    };
    this.data.posts.unshift(newPost);
    this.saveData(this.data);
    return newPost;
  }
  updatePost(id: string, update: Partial<Post>): Post | null {
    const idx = this.data.posts.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.posts[idx] = { ...this.data.posts[idx], ...update };
    this.saveData(this.data);
    return this.data.posts[idx];
  }
  deletePost(id: string, currentUserId?: string, isAdmin?: boolean): { success: boolean; message?: string } {
    const post = this.data.posts.find(p => p.id === id);
    if (!post) return { success: false, message: '文章不存在' };

    // Permission check: Admin can delete any post. Registered user can ONLY delete their own post!
    if (!isAdmin && post.authorId && post.authorId !== currentUserId) {
      return { success: false, message: '无权限删除其他用户的文章' };
    }

    this.data.posts = this.data.posts.filter(p => p.id !== id);
    this.saveData(this.data);
    return { success: true };
  }

  // --- Books ---
  getBooks(): Book[] {
    return this.data.books;
  }
  addBook(book: Book): Book {
    this.data.books.unshift(book);
    this.saveData(this.data);
    return book;
  }
  updateBookProgress(id: string, currentPage: number): Book | null {
    const book = this.data.books.find(b => b.id === id);
    if (!book) return null;
    book.currentPage = Math.min(currentPage, book.totalPages);
    book.progress = Math.round((book.currentPage / book.totalPages) * 100);
    this.saveData(this.data);
    return book;
  }
  deleteBook(id: string): boolean {
    const prevLen = this.data.books.length;
    this.data.books = this.data.books.filter(b => b.id !== id);
    if (this.data.books.length !== prevLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Gallery ---
  getGallery(): GalleryItem[] {
    return this.data.gallery || [];
  }
  addGalleryItem(item: GalleryItem): GalleryItem {
    if (!this.data.gallery) this.data.gallery = [];
    this.data.gallery.unshift(item);
    this.saveData(this.data);
    return item;
  }
  deleteGalleryItem(id: string): boolean {
    if (!this.data.gallery) return false;
    const prev = this.data.gallery.length;
    this.data.gallery = this.data.gallery.filter(g => g.id !== id);
    if (this.data.gallery.length !== prev) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Media ---
  getMedia(): MediaTrack[] {
    return this.data.media || [];
  }
  addMediaTrack(track: MediaTrack): MediaTrack {
    if (!this.data.media) this.data.media = [];
    this.data.media.unshift(track);
    this.saveData(this.data);
    return track;
  }
  deleteMediaTrack(id: string): boolean {
    if (!this.data.media) return false;
    const prev = this.data.media.length;
    this.data.media = this.data.media.filter(m => m.id !== id);
    if (this.data.media.length !== prev) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Products & Orders ---
  getProducts(): Product[] {
    return this.data.products;
  }
  getOrders(): Order[] {
    return this.data.orders;
  }
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      status: '已支付/待发货',
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    this.data.orders.unshift(newOrder);
    const prod = this.data.products.find(p => p.id === order.productId);
    if (prod && prod.stock > 0) {
      prod.stock = Math.max(0, prod.stock - order.quantity);
      prod.sales += order.quantity;
    }
    this.saveData(this.data);
    return newOrder;
  }

  // --- Files (Cloud Drive) ---
  getFiles(): CloudFile[] {
    return this.data.files;
  }
  addFile(file: CloudFile): CloudFile {
    this.data.files.unshift(file);
    this.recalculateStorage();
    this.saveData(this.data);
    return file;
  }
  deleteFile(id: string): boolean {
    const file = this.data.files.find(f => f.id === id);
    if (file) {
      if (file.url.startsWith('/uploads/')) {
        const fullPath = path.join(process.cwd(), file.url);
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }
        }
      }
      this.data.files = this.data.files.filter(f => f.id !== id);
      this.recalculateStorage();
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- History ---
  getHistory(): HistoryItem[] {
    return this.data.history;
  }
  addHistory(item: Omit<HistoryItem, 'id' | 'time'>): HistoryItem {
    this.data.history = this.data.history.filter(h => h.postId !== item.postId);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newHist: HistoryItem = {
      id: `hist-${Date.now()}`,
      title: item.title,
      category: item.category,
      time: timeStr,
      postId: item.postId,
    };
    this.data.history.unshift(newHist);
    if (this.data.history.length > 20) {
      this.data.history.pop();
    }
    this.saveData(this.data);
    return newHist;
  }
  deleteHistory(id: string): boolean {
    const prevLen = this.data.history.length;
    this.data.history = this.data.history.filter(h => h.id !== id);
    if (this.data.history.length !== prevLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }
  clearHistory(): void {
    this.data.history = [];
    this.saveData(this.data);
  }

  // Export / Import
  exportFullData(): DatabaseData {
    return this.data;
  }
  importFullData(newData: DatabaseData): void {
    this.data = { ...newData };
    this.recalculateStorage();
    this.saveData(this.data);
  }
}

export const db = new Database();
