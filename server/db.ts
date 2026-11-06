import fs from 'fs';
import path from 'path';

export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  date: string;
  reads: number;
  likes: number;
  coverImage?: string;
  isBookmarked?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  totalPages: number;
  currentPage: number;
  progress: number;
  description: string;
  chapters: { title: string; content: string }[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sales: number;
  cover: string;
  desc: string;
  badge?: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface CloudFile {
  id: string;
  name: string;
  size: number;
  type: string;
  updatedAt: string;
  url: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  category: string;
  time: string;
  postId: string;
}

export interface HeroConfig {
  tag: string;
  title: string;
  description: string;
  bannerImage: string;
  storageUsed: number;
  storageTotal: number;
}

export interface SystemSettings {
  siteName: string;
  authorName: string;
  subtitle: string;
  avatar: string;
  aiModel: string;
  aiApiKey: string;
  aiBaseUrl: string;
  aiSystemPrompt: string;
  themeColor: string;
  d1Enabled: boolean;
  r2BucketName: string;
  webdavUrl: string;
}

export interface DatabaseData {
  posts: Post[];
  books: Book[];
  products: Product[];
  orders: Order[];
  files: CloudFile[];
  history: HistoryItem[];
  hero: HeroConfig;
  settings: SystemSettings;
}

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

const INITIAL_DATA: DatabaseData = {
  hero: {
    tag: '灵狐踏雪 · 随心而述 · 云端无界',
    title: '极简敏捷与多云边缘博客',
    description: '原生适配多云边缘 Pages（Cloudflare / 腾讯云 / 阿里云），一键拉取与构建，集成 D1 边缘数据库与全功能媒体中枢。',
    bannerImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    storageUsed: 81.6,
    storageTotal: 10240, // 10 GB
  },
  settings: {
    siteName: '白狐博客 - WhiteFox Blog',
    authorName: 'fox (站长)',
    subtitle: '优雅多云架构 · 白狐极简数字空间',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    aiModel: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    aiApiKey: '',
    aiBaseUrl: 'https://api.deepseek.com/v1',
    aiSystemPrompt: '你是由白狐博客驱动的专家级智能编程与技术架构顾问。请用专业、详实、严谨、优雅的中文提供准确的代码实现、架构建议与深度分析。',
    themeColor: '#f43f5e',
    d1Enabled: true,
    r2BucketName: 'fox-blog-assets',
    webdavUrl: 'https://dav.jianguoyun.com/dav/',
  },
  posts: [
    {
      id: 'post-1',
      title: '青丘夜雪：白狐博客的设计哲学与云原生构建指南',
      summary: '白狐 (WhiteFox) 致力于融合东方古典意蕴与前沿现代云原生技术架构。本篇文章探讨现代博客与云边协同存储的深度实践。',
      content: `## 东方意蕴与极简现代的碰撞\n\n在这个信息过载的时代，现代博客不仅是知识沉淀的容器，更是一个人精神世界的数字花园。\n\n白狐博客 (WhiteFox Blog) 在视觉上以极简纯粹的翡翠绿与温润纯白为主基调，辅以灵动的玫红点缀；在架构上全面拥抱多云边缘计算（Cloudflare Pages、Vercel、腾讯云 EdgeOne 与阿里云 ESA）。\n\n### 为什么选择边缘计算？\n\n1. **全球就近毫秒级响应**：边缘节点分布在离用户最近的 POP 点。\n2. **真正无状态与边缘数据库**：借助 Cloudflare D1 或轻量化 Serverless 数据库，无需担心繁重的运维负担。\n3. **多云协同存储**：通过统一的对象存储 API，将图片、影音与大文件智能路由至 R2、COS 或 OSS。`,
      category: '技术视界',
      tags: ['Cloudflare', '多云部署', 'UI美学', 'React'],
      date: '2025-05-18',
      reads: 1280,
      likes: 64,
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      isBookmarked: false,
    },
    {
      id: 'post-2',
      title: '多云时代的对象存储实践：R2、OSS 与 COS 的互联互通',
      summary: '深入对比 Cloudflare R2、阿里云 OSS 和腾讯云 COS 在静态托管与媒体存储中的性能表现、计费优势及统一 API 封装。',
      content: `## 对象存储的演进与选型\n\n现代全栈应用往往对富媒体资产有着极高的要求。传统服务器本地磁盘在扩展性和全球分发速度上存在天然瓶颈。\n\n### 核心优势对比\n\n- **Cloudflare R2**：完全免除外网下行流量费（Egress Free），与 Workers 和 Pages 深度契合，适合海量读请求的公共资产。\n- **阿里云 OSS**：国内节点访问极其迅捷，图片实时处理管道（x-oss-process）成熟完备。\n- **腾讯云 COS**：与微信生态和 EdgeOne 边缘加速无缝整合。\n\n### 统一存储抽象层\n\n通过统一的 S3 兼容协议客户端，我们在 fox2 中实现了存储桶热切换，无感知迁移数据。`,
      category: '多云架构',
      tags: ['对象存储', 'R2', 'COS', 'OSS'],
      date: '2025-05-15',
      reads: 860,
      likes: 42,
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      isBookmarked: true,
    },
    {
      id: 'post-3',
      title: '数字花园漫步：构建随身私有书架与网络收藏枢纽',
      summary: '信息碎片化时代，如何将高质量电子书、网络长文、影视媒体高效整合并永久保存？白狐个人数字中心全攻略。',
      content: `## 告别信息焦虑\n\n现代人的阅读习惯经常分散在微信读书、Kindle、Pocket、各类网盘与本地文件夹中。打造一个集中式数字书架与阅读进度跟踪系统，能极大提升心智专注度。\n\n### 核心功能构建\n\n- 随行进度记忆：阅读到哪一章节，实时记录与多端同步。\n- 典籍与现代知识同框：从古典《道德经》到现代《云原生实战架构手册》，在统一的舒适界面中随时沉浸研读。`,
      category: '数字生活',
      tags: ['书架', '书签管理', '知识库'],
      date: '2025-05-10',
      reads: 2150,
      likes: 98,
      coverImage: 'https://images.unsplash.com/photo-1507842229451-9f7917820bb3?auto=format&fit=crop&w=800&q=80',
      isBookmarked: false,
    },
    {
      id: 'post-4',
      title: '从单体到全球边缘：白狐博客高可用架构解析',
      summary: '全解析 fox2 博客的工程化与高可用演进：如何做到零外部强依赖、零卡顿即开即用、且在各种严苛环境实现100%稳定。',
      content: `## 现代博客的韧性设计\n\n优秀的软件系统应该具备**自愈性**与**自包含性**。\n\n在 fox2 的设计中：\n1. **零 LocalStorage 强依赖**：所有状态全部经由后端服务持久化保存，杜绝浏览器沙箱清理导致数据遗失。\n2. **跨云平滑降级**：当处于传统 Node.js 环境时启用服务内置持久存储；当处于边缘 Serverless 环境时无缝桥接 D1 / 云端 API。`,
      category: '边缘计算',
      tags: ['边缘计算', '高可用', '架构设计'],
      date: '2025-05-02',
      reads: 3410,
      likes: 185,
      coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      isBookmarked: true,
    }
  ],
  books: [
    {
      id: 'book-1',
      title: '道德经真义',
      author: '老子 / 白狐注解',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      category: '国学典籍',
      totalPages: 81,
      currentPage: 3,
      progress: 4,
      description: '道可道，非常道；名可名，非常名。体悟东方天人合一与无为而治之哲学渊薮。',
      chapters: [
        {
          title: '第一章 · 体道',
          content: '道可道，非常道。名可名，非常名。\n无名天地之始；有名万物之母。\n故常无，欲以观其妙；常有，欲以观其徼。\n此两者，同出而异名，同谓之玄。玄之又玄，众妙之门。'
        },
        {
          title: '第二章 · 养身',
          content: '天下皆知美之为美，斯恶已。皆知善之为善，斯不善已。\n故有无相生，难易相成，长短相形，高下相倾，音声相和，前后相随。\n是以圣人处无为之事，行不言之教；万物作而弗始，生而弗有，为而弗恃，功成而弗居。夫唯弗居，是以不去。'
        },
        {
          title: '第三章 · 安民',
          content: '不尚贤，使民不争；不贵难得之货，使民不为盗；不见可欲，使民心不乱。\n是以圣人之治，虚其心，实其腹，弱其志，强其骨。常使民无知无欲。使夫智者不敢为也。为无为，则无不治。'
        }
      ]
    },
    {
      id: 'book-2',
      title: '云原生实战架构手册',
      author: 'fox 站长',
      cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      category: '前沿技术',
      totalPages: 120,
      currentPage: 36,
      progress: 30,
      description: '深入探讨微服务、Serverless、边缘计算、Kubernetes 与高并发架构调优。',
      chapters: [
        {
          title: '第一章 · 云原生范式革命',
          content: '云原生技术有利于各组织在公有云、私有云和混合云等新型动态环境中，构建和运行可弹性扩展的应用。核心包含容器、服务网格、微服务、不可变基础设施和声明式API。'
        },
        {
          title: '第二章 · 边缘网络与全球分发',
          content: '通过在遍布全球的网络边缘执行代码与缓存静态及动态数据，应用可以实现亚毫秒级低延迟，大幅减轻中心源站负载。'
        }
      ]
    },
    {
      id: 'book-3',
      title: '聊斋志异之白狐篇',
      author: '蒲松龄',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
      category: '志怪文学',
      totalPages: 50,
      currentPage: 15,
      progress: 30,
      description: '空山灵雨，白狐幻形。世间至情至性，尽在笔端狐仙幻梦之中。',
      chapters: [
        {
          title: '卷一 · 寒斋雪客',
          content: '太原王生早行，遇一女子，抱袱独步，甚难蹇行。见其娇丽绝伦，心窃乐之，加速前趁……'
        },
        {
          title: '卷二 · 灵狐夜话',
          content: '夜雪纷飞，柴门轻扣。白裘少年负琴而入，笑语温存，留香盈室……'
        }
      ]
    }
  ],
  products: [
    {
      id: 'prod-1',
      name: '白狐居士 · 专属定制实木书签 (两枚入)',
      price: 68.0,
      originalPrice: 98.0,
      stock: 50,
      sales: 126,
      cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
      desc: '进口天然红木雕琢，篆刻“言由心生，灵狐逸仙”，温润雅致，读书抚琴必备。',
      badge: '热卖甄选'
    },
    {
      id: 'prod-2',
      name: 'WhiteFox 极客多云架构连帽卫衣',
      price: 219.0,
      originalPrice: 289.0,
      stock: 80,
      sales: 89,
      cover: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      desc: '400g 重磅精梳棉，亲肤保暖。后背激光夜光印花，呈现白狐边缘云图腾。',
      badge: '站长力荐'
    },
    {
      id: 'prod-3',
      name: '青丘夜雪 · 纯铜双模机械键帽',
      price: 128.0,
      originalPrice: 158.0,
      stock: 35,
      sales: 64,
      cover: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      desc: '手工打磨做旧黄铜材质，微雕白狐图纹，透光设计，敲击清脆手感沉稳。',
      badge: '限量手作'
    },
    {
      id: 'prod-4',
      name: '白狐居 · 灵犀手冲咖啡挂耳礼盒 (10包入)',
      price: 79.0,
      originalPrice: 99.0,
      stock: 120,
      sales: 312,
      cover: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      desc: '埃塞俄比亚耶加雪菲 + 哥伦比亚慧兰庄园豆，浅中烘焙，花果香气，写代码灵感源泉。'
    }
  ],
  orders: [
    {
      id: 'ord-20250501',
      productId: 'prod-1',
      productName: '白狐居士 · 专属定制实木书签 (两枚入)',
      quantity: 1,
      totalPrice: 68.0,
      customerName: '李青松',
      customerPhone: '138****6688',
      shippingAddress: '上海市浦东新区张江高科技园区 88 号',
      paymentMethod: '微信支付',
      status: '已发货',
      createdAt: '2025-05-18 14:32:00'
    }
  ],
  files: [
    {
      id: 'file-1',
      name: '青丘落雪背景视频.mp4',
      size: 45286400, // 43.2 MB
      type: 'video/mp4',
      updatedAt: '2025-05-18 10:20',
      url: '/uploads/sample-video.mp4'
    },
    {
      id: 'file-2',
      name: '白狐原画壁纸集.zip',
      size: 38400000, // 36.6 MB
      type: 'application/zip',
      updatedAt: '2025-05-16 15:40',
      url: '/uploads/fox-wallpapers.zip'
    },
    {
      id: 'file-3',
      name: '云原生架构图谱与D1实践.pdf',
      size: 1890000, // 1.8 MB
      type: 'application/pdf',
      updatedAt: '2025-05-14 09:12',
      url: '/uploads/cloud-architecture.pdf'
    }
  ],
  history: [
    {
      id: 'hist-1',
      title: '从单体到全球边缘：白狐博客高可用架构解析',
      category: '边缘计算',
      time: '10:24',
      postId: 'post-4'
    },
    {
      id: 'hist-2',
      title: '多云时代的对象存储实践：R2、OSS 与 COS 的互联互通',
      category: '多云架构',
      time: '09:40',
      postId: 'post-2'
    }
  ]
};

class Database {
  private data: DatabaseData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseData {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
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

  // --- Hero & Settings ---
  getHero(): HeroConfig {
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
  createPost(post: Omit<Post, 'id' | 'reads' | 'likes'>): Post {
    const newPost: Post = {
      ...post,
      id: `post-${Date.now()}`,
      reads: 1,
      likes: 0,
      isBookmarked: false,
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
  deletePost(id: string): boolean {
    const prevLen = this.data.posts.length;
    this.data.posts = this.data.posts.filter(p => p.id !== id);
    if (this.data.posts.length !== prevLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Books ---
  getBooks(): Book[] {
    return this.data.books;
  }
  updateBookProgress(id: string, currentPage: number): Book | null {
    const book = this.data.books.find(b => b.id === id);
    if (!book) return null;
    book.currentPage = Math.min(currentPage, book.totalPages);
    book.progress = Math.round((book.currentPage / book.totalPages) * 100);
    this.saveData(this.data);
    return book;
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
    // decrease stock if exists
    const prod = this.data.products.find(p => p.id === order.productId);
    if (prod && prod.stock > 0) {
      prod.stock = Math.max(0, prod.stock - order.quantity);
      prod.sales += order.quantity;
    }
    this.saveData(this.data);
    return newOrder;
  }

  // --- Files ---
  getFiles(): CloudFile[] {
    return this.data.files;
  }
  addFile(file: CloudFile): CloudFile {
    this.data.files.unshift(file);
    // calculate storage used
    const totalBytes = this.data.files.reduce((acc, cur) => acc + cur.size, 0);
    this.data.hero.storageUsed = Number((totalBytes / (1024 * 1024)).toFixed(1));
    this.saveData(this.data);
    return file;
  }
  deleteFile(id: string): boolean {
    const file = this.data.files.find(f => f.id === id);
    if (file) {
      // if file is on disk, attempt removal
      if (file.url.startsWith('/uploads/')) {
        const fullPath = path.join(process.cwd(), file.url);
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }
        }
      }
      this.data.files = this.data.files.filter(f => f.id !== id);
      const totalBytes = this.data.files.reduce((acc, cur) => acc + cur.size, 0);
      this.data.hero.storageUsed = Number((totalBytes / (1024 * 1024)).toFixed(1));
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
    // Avoid duplicate at top
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
    this.saveData(this.data);
  }
}

export const db = new Database();
