export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email?: string;
  avatar?: string;
  createdAt: string;
}

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
  authorId?: string;
  authorName?: string;
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
  format?: 'epub' | 'pdf' | 'txt' | 'mobi' | 'azw3' | 'other';
  fileUrl?: string;
  fileSize?: number;
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
  uploadedBy?: string;
  uploaderRole?: 'admin' | 'user';
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

export interface WebDavConfig {
  serverUrl: string;
  username: string;
  password: string;
  remotePath: string;
}

export interface CloudflareBindings {
  d1Bound: boolean;
  d1DatabaseName: string;
  r2Bound: boolean;
  r2BucketName: string;
  kvBound: boolean;
  kvNamespace: string;
  aiBound: boolean;
  aiModelName: string;
}

export interface SystemSettings {
  siteName: string;
  authorName: string;
  subtitle: string;
  avatar: string;
  headerBrand: string;
  aiModel: string;
  aiApiKey: string;
  aiBaseUrl: string;
  aiSystemPrompt: string;
  themeColor: string;
  themeLayout: 'default' | 'compact' | 'wide';
  d1Enabled: boolean;
  r2BucketName: string;
  webdavUrl: string;
  webdavConfig: WebDavConfig;
  cfBindings: CloudflareBindings;
  requireEmailRegistration?: boolean;
  hideNonBlogForGuests?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  likes: number;
  uploadedAt?: string;
}

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  cover: string;
  type?: 'audio' | 'video';
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
  d1Bound: boolean;
  r2Bound: boolean;
  activeStorage: 'kv' | 'db' | 'local';
  lastSyncTime: string;
  kvNamespace: string;
  syncLatencyMs: number;
  cloudStorageUsedMb: number;
  cloudStorageTotalMb: number;
  localStorageUsedMb: number;
}
