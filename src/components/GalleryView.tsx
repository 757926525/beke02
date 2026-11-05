import React, { useState } from 'react';
import { GalleryItem } from '../types';
import { Camera, Heart, Maximize2, X, Download } from 'lucide-react';

export const GalleryView: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([
    {
      id: 'gal-1',
      title: '青丘夜雪 · 灵狐仙踪',
      category: '风光纪实',
      imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
      likes: 124,
    },
    {
      id: 'gal-2',
      title: '空山新雨 · 东方禅意',
      category: '意境摄影',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      likes: 89,
    },
    {
      id: 'gal-3',
      title: '极客云端 · 数据星河',
      category: '数码视界',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      likes: 168,
    },
    {
      id: 'gal-4',
      title: '古卷残烛 · 文人书房',
      category: '生活美学',
      imageUrl: 'https://images.unsplash.com/photo-1507842229451-9f7917820bb3?auto=format&fit=crop&w=1200&q=80',
      likes: 72,
    },
    {
      id: 'gal-5',
      title: '林深见鹿 · 幽谷微光',
      category: '自然光影',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
      likes: 142,
    },
    {
      id: 'gal-6',
      title: '终端晨曦 · 代码之诗',
      category: '数码视界',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
      likes: 95,
    },
  ]);

  const [activeCategory, setActiveCategory] = useState('全部');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const categories = ['全部', '风光纪实', '意境摄影', '数码视界', '生活美学', '自然光影'];

  const filtered = items.filter(
    item => activeCategory === '全部' || item.category === activeCategory
  );

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, likes: i.likes + 1 } : i))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">光影视界 · 视觉相册</h2>
          <p className="text-xs text-slate-500 mt-0.5">多云对象存储分发 · 4K 高清画质呈现</p>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <div
            key={item.id}
            onClick={() => setPreviewItem(item)}
            className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-rose-100/60 shadow-xs cursor-pointer aspect-4/3"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
              <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-md">
                {item.category}
              </span>

              <div className="flex items-center justify-between text-white">
                <div>
                  <h4 className="text-sm font-bold truncate">{item.title}</h4>
                </div>
                <button
                  onClick={e => toggleLike(item.id, e)}
                  className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md hover:bg-rose-500 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{item.likes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={previewItem.imageUrl}
              alt={previewItem.title}
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
            />

            <div className="mt-4 text-center text-white">
              <h3 className="text-base font-bold">{previewItem.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{previewItem.category} · 获赞 {previewItem.likes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
