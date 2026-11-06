import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import {
  Camera,
  Upload,
  Trash2,
  Heart,
  Plus,
  Search,
  LayoutGrid,
  List,
  Columns,
  Grid3X3,
  Download
} from 'lucide-react';
import { api } from '../api';

interface GalleryViewProps {
  isAdmin?: boolean;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ isAdmin }) => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'medium' | 'small' | 'large' | 'detail'>('medium');
  const [search, setSearch] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchGallery = async () => {
    try {
      const data = await api.getGallery();
      setGallery(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await api.uploadImage(file);
      await api.addGalleryItem({
        title: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl: res.url,
        category: '东方美学'
      });
      fetchGallery();
    } catch (err: any) {
      alert('上传相册照片失败: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('确认从相册删除此照片？')) return;
    await api.deleteGalleryItem(id);
    setGallery(prev => prev.filter(p => p.id !== id));
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
  };

  const filteredPhotos = gallery.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Ribbon */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-sky-900/10 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-600" />
            <span>光影视界 · 云相册资产库</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            高清本地/云端相片无损存储，支持一键引入博客正文与多模式检视。
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isAdmin && (
            <label className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-sky-600 text-white text-xs font-medium hover:bg-sky-700 cursor-pointer shadow-xs transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? '上传中...' : '上传相片'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadPhoto}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}

          {/* 4 View Modes */}
          <div className="flex items-center border border-slate-200 rounded-md p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('small')}
              title="小图视图"
              className={`p-1 rounded ${viewMode === 'small' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('medium')}
              title="中图视图"
              className={`p-1 rounded ${viewMode === 'medium' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('large')}
              title="大图卡片视图"
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

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-sky-300">
          <Camera className="w-8 h-8 text-sky-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">云相册暂无照片</p>
        </div>
      ) : viewMode === 'detail' ? (
        /* Detail Table */
        <div className="bg-white rounded-xl border border-sky-900/10 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8faf9] text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">缩略图</th>
                <th className="py-2.5 px-3">相片名称</th>
                <th className="py-2.5 px-3">专栏分类</th>
                <th className="py-2.5 px-3">上传日期</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPhotos.map(item => (
                <tr key={item.id} className="hover:bg-sky-50/50 transition">
                  <td className="py-2 px-3">
                    <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded object-cover" />
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{item.title}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700">{item.category}</span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{item.uploadedAt || '2025-05-20'}</td>
                  <td className="py-2 px-3 text-right">
                    {isAdmin && (
                      <button
                        onClick={e => handleDeletePhoto(item.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Visual Photo Grids */
        <div className={
          viewMode === 'small'
            ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3'
            : (viewMode === 'large'
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4')
        }>
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative bg-white rounded-lg border border-sky-900/10 overflow-hidden shadow-2xs hover:shadow-md cursor-pointer transition"
            >
              <div className={`w-full overflow-hidden ${viewMode === 'small' ? 'h-28' : (viewMode === 'large' ? 'h-72' : 'h-48')}`}>
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <div className="p-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate" title={photo.title}>
                  {photo.title}
                </span>
                {isAdmin && (
                  <button
                    onClick={e => handleDeletePhoto(photo.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto.imageUrl} alt={selectedPhoto.title} className="max-h-[75vh] object-contain bg-black" />
            <div className="p-4 flex items-center justify-between text-xs">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{selectedPhoto.title}</h3>
                <span className="text-slate-400">{selectedPhoto.category}</span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
