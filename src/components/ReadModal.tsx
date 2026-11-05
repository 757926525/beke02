import React from 'react';
import { Post } from '../types';
import { X, Calendar, Eye, Heart, Bookmark, Tag, ArrowLeft } from 'lucide-react';

interface ReadModalProps {
  post: Post | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
}

export const ReadModal: React.FC<ReadModalProps> = ({
  post,
  onClose,
  onLike,
  onBookmark,
}) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-fadeIn overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回博文列表</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onLike(post.id)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-500 flex items-center space-x-1 text-xs transition-colors"
              title="点赞"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>{post.likes}</span>
            </button>

            <button
              onClick={() => onBookmark(post.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                post.isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-500'
              }`}
              title="收藏"
            >
              <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1">
          {/* Cover image if present */}
          {post.coverImage && (
            <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden mb-6 shadow-sm">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200/50">
              {post.category}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center space-x-4 text-xs text-slate-400 pb-6 border-b border-slate-100">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{post.date}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.reads} 次研读</span>
              </span>
              <span>作者: fox (站长)</span>
            </div>

            {/* Markdown rendered body */}
            <div className="prose max-w-none text-slate-800 leading-relaxed text-sm sm:text-base space-y-4 pt-2 whitespace-pre-wrap font-serif">
              {post.content}
            </div>

            {/* Tags */}
            <div className="pt-8 border-t border-slate-100 flex flex-wrap gap-2">
              {post.tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"
                >
                  <Tag className="w-3 h-3 mr-1 text-slate-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
