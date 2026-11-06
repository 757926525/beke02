import React, { useState } from 'react';
import { Post, HistoryItem, User } from '../types';
import {
  Heart,
  Bookmark,
  Eye,
  Calendar,
  Trash2,
  Search,
  Sparkles,
  LayoutGrid,
  List,
  Columns,
  Grid3X3
} from 'lucide-react';

interface BlogViewProps {
  posts: Post[];
  history: HistoryItem[];
  currentUser?: User | null;
  onSelectPost: (post: Post) => void;
  onLikePost: (id: string, e?: React.MouseEvent) => void;
  onBookmarkPost: (id: string, e?: React.MouseEvent) => void;
  onClearHistory: () => void;
  onDeletePost?: (id: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  posts,
  history,
  currentUser,
  onSelectPost,
  onLikePost,
  onBookmarkPost,
  onClearHistory,
  onDeletePost,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [viewMode, setViewMode] = useState<'medium' | 'small' | 'large' | 'detail'>('medium');

  const isAdmin = currentUser?.role === 'admin';

  const categories = ['全部', '技术视界', '多云架构', '数字生活', '边缘计算', '东方美学'];

  const filteredPosts = posts.filter(post => {
    const matchesCat = selectedCategory === '全部' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Post Section */}
      <div className="lg:col-span-3 space-y-6">
        {/* Controls Ribbon: Category, Search & 4 View Modes */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-sky-900/10 shadow-xs">
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="搜索博文或标签..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>

            {/* 4 View Mode Switchers: Small, Medium, Large, Detail */}
            <div className="flex items-center border border-slate-200 rounded-md p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('small')}
                title="小图紧凑视图"
                className={`p-1 rounded ${viewMode === 'small' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('medium')}
                title="中图标准视图"
                className={`p-1 rounded ${viewMode === 'medium' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('large')}
                title="大图巨幕视图"
                className={`p-1 rounded ${viewMode === 'large' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('detail')}
                title="详细信息列表"
                className={`p-1 rounded ${viewMode === 'detail' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Posts Rendering based on ViewMode */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-sky-300">
            <p className="text-sm text-slate-500">未检索到匹配文章</p>
          </div>
        ) : (
          <div className={
            viewMode === 'small'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'
              : (viewMode === 'large'
                ? 'grid grid-cols-1 gap-6'
                : (viewMode === 'detail'
                  ? 'space-y-3'
                  : 'grid grid-cols-1 md:grid-cols-2 gap-4'))
          }>
            {filteredPosts.map(post => {
              const canDelete = isAdmin || (currentUser && currentUser.id === post.authorId);

              // Detail View
              if (viewMode === 'detail') {
                return (
                  <div
                    key={post.id}
                    onClick={() => onSelectPost(post)}
                    className="p-3 bg-white rounded-lg border border-sky-900/10 hover:border-sky-500 shadow-2xs hover:shadow-sm cursor-pointer transition flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <img
                        src={post.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80'}
                        alt={post.title}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="truncate">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">
                            {post.category}
                          </span>
                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-sky-700 truncate">
                            {post.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{post.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0 text-xs text-slate-400">
                      <span>{post.date}</span>
                      <span>👁️ {post.reads}</span>
                      {canDelete && onDeletePost && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm('确认删除该文章？')) onDeletePost(post.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              // Card / Grid Views (Small, Medium, Large)
              return (
                <article
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className={`bg-white rounded-lg border border-sky-900/10 hover:border-sky-500 shadow-2xs hover:shadow-md cursor-pointer transition flex flex-col overflow-hidden group ${
                    viewMode === 'large' ? 'md:flex-row h-auto md:h-64' : ''
                  }`}
                >
                  {/* Thumbnail Cover */}
                  <div className={`overflow-hidden relative ${
                    viewMode === 'small' ? 'h-32' : (viewMode === 'large' ? 'md:w-2/5 h-48 md:h-full' : 'h-44')
                  }`}>
                    <img
                      src={post.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium">
                      {post.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sky-600" />
                          {post.date}
                        </span>
                        <span>·</span>
                        <span>{post.authorName || 'fox 站长'}</span>
                      </div>
                      <h3 className={`font-bold text-slate-900 group-hover:text-sky-700 transition leading-snug line-clamp-2 ${
                        viewMode === 'small' ? 'text-xs' : (viewMode === 'large' ? 'text-lg' : 'text-sm')
                      }`}>
                        {post.title}
                      </h3>
                      <p className={`text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-2 ${
                        viewMode === 'small' ? 'hidden' : ''
                      }`}>
                        {post.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{post.reads}</span>
                        </span>
                        <button
                          onClick={e => onLikePost(post.id, e)}
                          className="flex items-center space-x-1 hover:text-rose-600 transition"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          <span>{post.likes}</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={e => onBookmarkPost(post.id, e)}
                          className={`p-1 rounded transition ${post.isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        {canDelete && onDeletePost && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (confirm('确认删除该文章？')) onDeletePost(post.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Sidebar: Outlook Style Clean Cards */}
      <div className="space-y-6">
        {/* Author Card */}
        <div className="bg-white p-5 rounded-lg border border-sky-900/10 shadow-xs">
          <div className="flex items-center space-x-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
              alt="fox"
              className="w-12 h-12 rounded-full object-cover border-2 border-sky-500 shadow-2xs"
            />
            <div>
              <h4 className="font-bold text-sm text-slate-800">fox · 唯一站长</h4>
              <p className="text-xs text-sky-700">青丘夜雪 · 蓝白 Outlook 空间</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            专注多云边缘计算（Cloudflare Pages/D1/R2）、TypeScript 与极简美学设计。全站严格采用后端持久化，零客户端脏存储。
          </p>
        </div>

        {/* Recent History Footprints */}
        <div className="bg-white p-4 rounded-lg border border-sky-900/10 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">近期足迹历程</span>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[11px] text-slate-400 hover:text-rose-600"
              >
                清空
              </button>
            )}
          </div>
          <div className="space-y-2">
            {history.slice(0, 5).map(item => (
              <div
                key={item.id}
                onClick={() => {
                  const p = posts.find(x => x.id === item.postId);
                  if (p) onSelectPost(p);
                }}
                className="p-1.5 rounded hover:bg-sky-50 cursor-pointer text-xs transition"
              >
                <div className="text-slate-800 font-medium truncate">{item.title}</div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                  <span>{item.category}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">暂无足迹记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
