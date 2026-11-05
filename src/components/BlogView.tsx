import React, { useState } from 'react';
import { Post, HistoryItem } from '../types';
import {
  Heart,
  Bookmark,
  Eye,
  Calendar,
  Search,
  Clock,
  Trash2,
  ChevronRight,
  Filter,
  Tag
} from 'lucide-react';

interface BlogViewProps {
  posts: Post[];
  history: HistoryItem[];
  onSelectPost: (post: Post) => void;
  onLikePost: (id: string, e: React.MouseEvent) => void;
  onBookmarkPost: (id: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  posts,
  history,
  onSelectPost,
  onLikePost,
  onBookmarkPost,
  onClearHistory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyBookmarks, setOnlyBookmarks] = useState<boolean>(false);

  // Extract categories
  const categories = ['全部', ...Array.from(new Set(posts.map(p => p.category)))];

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesCat = selectedCategory === '全部' || post.category === selectedCategory;
    const matchesQuery = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBookmark = !onlyBookmarks || post.isBookmarked;
    return matchesCat && matchesQuery && matchesBookmark;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Column (8 cols): Filters & Post Cards */}
      <div className="lg:col-span-8 space-y-6">
        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bookmark & Search */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                onlyBookmarks
                  ? 'bg-amber-50 text-amber-700 border-amber-300 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>收藏夹</span>
            </button>

            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索文章或标签..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Post Grid / List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 text-slate-500">
            <Filter className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">未找到符合条件的文章</p>
            <p className="text-xs text-slate-400 mt-1">尝试调整搜索关键词或分类条件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="group bg-white rounded-2xl border border-rose-100/70 overflow-hidden shadow-xs hover:shadow-md hover:border-rose-300 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Cover Image */}
                {post.coverImage && (
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide">
                      {post.category}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{post.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.reads}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => onLikePost(post.id, e)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors flex items-center space-x-0.5"
                          title="点赞"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-medium">{post.likes}</span>
                        </button>

                        <button
                          onClick={e => onBookmarkPost(post.id, e)}
                          className={`p-1.5 rounded-md transition-colors ${
                            post.isBookmarked
                              ? 'text-amber-500 bg-amber-50'
                              : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                          title={post.isBookmarked ? '取消收藏' : '收藏'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Column (4 cols): Profile & Browsing History */}
      <div className="lg:col-span-4 space-y-6">
        {/* Author Card */}
        <div className="bg-white rounded-2xl p-6 border border-rose-100/80 shadow-xs text-center">
          <div className="relative inline-block mx-auto mb-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
              alt="fox 站长"
              className="w-20 h-20 rounded-full object-cover border-4 border-rose-100 shadow-sm mx-auto"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">fox (站长)</h4>
          <p className="text-xs text-rose-600 font-medium mt-0.5">全栈极客 · 多云架构爱好者</p>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            致力于构建轻量、极简且高可用的现代 Web 应用。热爱 Cloudflare 边缘计算、React 与开源生态。
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="block font-bold text-slate-800 text-sm">{posts.length}</span>
              <span className="text-[10px] text-slate-400">文章篇数</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="block font-bold text-slate-800 text-sm">
                {posts.reduce((acc, cur) => acc + cur.reads, 0)}
              </span>
              <span className="text-[10px] text-slate-400">全站阅读</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="block font-bold text-rose-600 text-sm">
                {posts.reduce((acc, cur) => acc + cur.likes, 0)}
              </span>
              <span className="text-[10px] text-slate-400">获赞总计</span>
            </div>
          </div>
        </div>

        {/* Browsing History Widget (Persisted in server) */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <h4 className="text-sm font-bold text-slate-900">足迹 · 浏览历史</h4>
            </div>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                title="清空历史"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">暂无最近浏览记录</p>
          ) : (
            <div className="space-y-2.5">
              {history.map(item => {
                const targetPost = posts.find(p => p.id === item.postId);
                return (
                  <div
                    key={item.id}
                    onClick={() => targetPost && onSelectPost(targetPost)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/60 border border-slate-100 hover:border-rose-200 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="pr-2 truncate">
                      <p className="text-xs font-medium text-slate-800 group-hover:text-rose-600 truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                        <span className="px-1.5 py-0.2 rounded bg-white text-slate-500 border border-slate-200">
                          {item.category}
                        </span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
