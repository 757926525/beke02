import React, { useState } from 'react';
import { HistoryItem, Post } from '../types';
import {
  Clock,
  Trash2,
  ExternalLink,
  Search,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface HistoryManagerViewProps {
  history: HistoryItem[];
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onDeleteHistoryItem: (id: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
  storageType?: 'kv' | 'db';
}

export const HistoryManagerView: React.FC<HistoryManagerViewProps> = ({
  history,
  posts,
  onSelectPost,
  onDeleteHistoryItem,
  onClearHistory,
  storageType = 'kv',
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('全部');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = ['全部', ...Array.from(new Set(history.map(h => h.category)))];

  const filteredHistory = history.filter(item => {
    const matchCat = selectedCat === '全部' || item.category === selectedCat;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleJump = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      onSelectPost(post);
    } else {
      alert('抱歉，该文章可能已被站长删除或迁移');
    }
  };

  const handleDeleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await onDeleteHistoryItem(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-rose-100/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              足迹管家
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-600 border border-sky-200/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              {storageType === 'kv' ? 'Cloudflare KV 优先持久化同步' : '边缘数据库 D1 同步'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 mt-2">浏览历史记录管理中枢</h2>
          <p className="text-xs text-slate-500 mt-1">
            实时记录阅读旅程，支持多维过滤、单条删除、全量清空与一键直达原文
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('确定要清空全部浏览历史记录吗？此操作将同步清理云端存储。')) {
                  onClearHistory();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空所有记录 ({history.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedCat === cat
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:w-64 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="在浏览足迹中搜索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-400"
          />
        </div>
      </div>

      {/* History List Cards */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs space-y-2">
          <FolderOpen className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-600 text-sm">暂无匹配的浏览足迹</p>
          <p>阅读任意博文随笔后，系统将自动通过 KV/数据库双擎引擎实时记录在此处</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map(item => {
            const matchedPost = posts.find(p => p.id === item.postId);
            return (
              <div
                key={item.id}
                onClick={() => handleJump(item.postId)}
                className="group bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-4.5 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {item.time}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => handleDeleteOne(item.id, e)}
                    disabled={deletingId === item.id}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                    title="从历史中移除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {matchedPost && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {matchedPost.summary}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {matchedPost ? `${matchedPost.reads} 次阅读 · ${matchedPost.likes} 赞` : '独立足迹'}
                  </span>
                  <div className="text-rose-600 font-semibold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>一键直达阅读</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
