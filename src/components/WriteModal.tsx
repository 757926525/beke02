import React, { useState, useEffect } from 'react';
import {
  X,
  Image as ImageIcon,
  Upload,
  Film,
  Music,
  Check,
  Sparkles,
  Link2
} from 'lucide-react';
import { Post, GalleryItem, MediaTrack } from '../types';
import { api } from '../api';

interface WriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Partial<Post>) => Promise<void>;
}

export const WriteModal: React.FC<WriteModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('技术视界');
  const [tags, setTags] = useState('原创, 架构');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');

  // Media pickers
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [mediaList, setMediaList] = useState<MediaTrack[]>([]);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getGallery().then(setGallery).catch(() => {});
      api.getMedia().then(setMediaList).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUploadLocalCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const res = await api.uploadImage(file);
      setCoverImage(res.url);
    } catch (err) {
      alert('上传本地封面失败: ' + err);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleInsertPhoto = (photo: GalleryItem) => {
    const markdownImage = `\n\n![${photo.title}](${photo.imageUrl})\n*${photo.title}*\n\n`;
    setContent(prev => prev + markdownImage);
    setShowPhotoPicker(false);
  };

  const handleInsertMedia = (media: MediaTrack) => {
    if (media.type === 'video') {
      const videoTag = `\n\n<video controls src="${media.url}" poster="${media.cover}" style="max-width:100%; border-radius:8px;"></video>\n*视频: ${media.title}*\n\n`;
      setContent(prev => prev + videoTag);
    } else {
      const audioTag = `\n\n<audio controls src="${media.url}" style="width:100%; margin: 12px 0;"></audio>\n*音频: ${media.title} - ${media.artist}*\n\n`;
      setContent(prev => prev + audioTag);
    }
    setShowMediaPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      await onSubmit({
        title,
        summary: summary.trim() || title.slice(0, 80),
        content,
        category,
        tags: tags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
        coverImage,
      });
      onClose();
      // Reset
      setTitle('');
      setContent('');
      setSummary('');
    } catch (err: any) {
      alert(err.message || '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-sky-900/10 max-w-4xl w-full p-6 my-8 max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded bg-sky-600 text-white flex items-center justify-center font-bold">
              ✍️
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">撰写与发布博文</h2>
              <p className="text-xs text-slate-500">支持一键插入云相册高清照片、视频、音乐与本地封面上传</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                文章标题 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例如: 探索边缘计算时代的云原生架构..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                专栏分类
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
              >
                <option value="技术视界">技术视界</option>
                <option value="多云架构">多云架构</option>
                <option value="数字生活">数字生活</option>
                <option value="边缘计算">边缘计算</option>
                <option value="东方美学">东方美学</option>
              </select>
            </div>
          </div>

          {/* Cover image & Local Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              封面照片 (支持自定义本地图片上传或粘贴 URL)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md outline-none"
              />
              <label className="flex items-center justify-center space-x-1 px-3 py-2 bg-sky-50 border border-sky-300 text-sky-800 rounded-md text-xs font-medium cursor-pointer hover:bg-sky-100 transition whitespace-nowrap">
                <Upload className="w-3.5 h-3.5 text-sky-600" />
                <span>{uploadingCover ? '上传中...' : '上传本地图片为封面'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLocalCover}
                  className="hidden"
                  disabled={uploadingCover}
                />
              </label>
            </div>
            {coverImage && (
              <div className="mt-2 w-36 h-20 rounded border border-slate-200 overflow-hidden">
                <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Quick Toolbar: Insert Album Image / Video / Audio */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-sky-50/70 border border-sky-200/80 text-xs">
            <span className="font-semibold text-sky-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 快捷媒体插入:
            </span>
            <button
              type="button"
              onClick={() => {
                setShowPhotoPicker(!showPhotoPicker);
                setShowMediaPicker(false);
              }}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-sky-300 rounded text-slate-700 hover:text-sky-700 hover:border-sky-500 shadow-2xs transition"
            >
              <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>一键插入云相册图片</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMediaPicker(!showMediaPicker);
                setShowPhotoPicker(false);
              }}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-sky-300 rounded text-slate-700 hover:text-sky-700 hover:border-sky-500 shadow-2xs transition"
            >
              <Film className="w-3.5 h-3.5 text-sky-600" />
              <span>一键插入视频与音乐</span>
            </button>
          </div>

          {/* Cloud Album Picker Modal Popover */}
          {showPhotoPicker && (
            <div className="p-3 bg-white rounded-lg border border-sky-300 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">选择要插入的相册图片 (点击即可插入正文):</span>
                <button
                  type="button"
                  onClick={() => setShowPhotoPicker(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  关闭
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {gallery.map(img => (
                  <div
                    key={img.id}
                    onClick={() => handleInsertPhoto(img)}
                    className="group cursor-pointer border border-slate-200 rounded overflow-hidden hover:border-sky-500 relative"
                  >
                    <img src={img.imageUrl} alt={img.title} className="w-full h-16 object-cover" />
                    <div className="text-[10px] p-1 truncate text-slate-600 group-hover:text-sky-700 bg-white">
                      {img.title}
                    </div>
                  </div>
                ))}
                {gallery.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-slate-400">
                    云相册暂无照片，请先在【光影视界】或系统管理上传
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media Picker Popover */}
          {showMediaPicker && (
            <div className="p-3 bg-white rounded-lg border border-sky-300 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">选择要插入的影音文件 (点击即可插入正文):</span>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  关闭
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {mediaList.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleInsertMedia(item)}
                    className="flex items-center space-x-2 p-2 border border-slate-200 rounded hover:border-sky-500 cursor-pointer bg-slate-50 hover:bg-sky-50"
                  >
                    {item.type === 'video' ? <Film className="w-4 h-4 text-rose-500" /> : <Music className="w-4 h-4 text-sky-600" />}
                    <div className="text-xs truncate">
                      <div className="font-semibold text-slate-800">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.artist || '站长'} · {item.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              文章摘要
            </label>
            <input
              type="text"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="简要概括文章精要（选填）"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md outline-none"
            />
          </div>

          {/* Content Markdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              文章正文 (Markdown 语法) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={9}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="在此输入精彩文章正文，支持 Markdown 标记与 HTML 媒体标签..."
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              标签 (逗号分隔)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="原创, 边缘计算, Cloudflare"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-medium shadow-xs transition disabled:opacity-50"
            >
              {submitting ? '发布中...' : '立即发布'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
