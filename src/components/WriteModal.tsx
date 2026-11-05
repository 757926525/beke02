import React, { useState } from 'react';
import { X, Send, Image, Tag, Folder } from 'lucide-react';
import { Post } from '../types';

interface WriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Partial<Post>) => Promise<void>;
}

export const WriteModal: React.FC<WriteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('技术视界');
  const [summary, setSummary] = useState('');
  const [tagsText, setTagsText] = useState('原创, 云原生, 架构设计');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const tags = tagsText.split(/[,，\s]+/).filter(Boolean);
      await onSubmit({
        title,
        category,
        summary: summary || title.slice(0, 80),
        content,
        tags,
        coverImage,
      });
      // reset
      setTitle('');
      setContent('');
      setSummary('');
      onClose();
    } catch (err) {
      alert('发布失败，请检查网络或服务端连接。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✍️</span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">发表新博客文章</h3>
              <p className="text-[11px] text-slate-500">文章将永久同步写入服务端持久存储 (Zero LocalStorage)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">文章标题 *</label>
            <input
              type="text"
              required
              placeholder="请输入优雅引人深思的文章标题..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">分类</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
              >
                <option value="技术视界">技术视界</option>
                <option value="多云架构">多云架构</option>
                <option value="数字生活">数字生活</option>
                <option value="边缘计算">边缘计算</option>
                <option value="随笔感悟">随笔感悟</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">标签 (逗号或空格分隔)</label>
              <input
                type="text"
                value={tagsText}
                onChange={e => setTagsText(e.target.value)}
                placeholder="Cloudflare, React, 架构"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">封面图片 URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-mono text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">概要简介 (留空自动截取正文)</label>
            <input
              type="text"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="概括文章核心思想，将在卡片列表中展示..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">正文内容 (支持 Markdown 语法) *</label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="## 记录你的思考与灵感...\n\n支持 Markdown 格式与代码块。"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              取消
            </button>

            <button
              type="submit"
              disabled={submitting || !title || !content}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-emerald-600 hover:from-rose-600 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? '发布中...' : '立即发布'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
