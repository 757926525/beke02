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
  requireEmailRegistration?: boolean;
  hideNonBlogForGuests?: boolean;
  adminPassword?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  likes: number;
}

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  cover: string;
}

export type NavTab =
  | 'blog'
  | 'books'
  | 'shop'
  | 'gallery'
  | 'media'
  | 'ai'
  | 'cloud'
  | 'history'
  | 'admin';

export interface StorageStatus {
  kvConnected: boolean;
  dbConnected: boolean;
  activeStorage: 'kv' | 'db';
  lastSyncTime: string;
  kvNamespace: string;
  syncLatencyMs: number;
}
