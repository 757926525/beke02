import React, { useState } from 'react';
import { HeroConfig } from '../types';
import { Database, HardDrive, Sparkles, Image as ImageIcon, Upload } from 'lucide-react';
import { api } from '../api';

interface HeroBannerProps {
  hero: HeroConfig;
  isAdmin?: boolean;
  onUpdateHero?: (updated: Partial<HeroConfig>) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ hero, isAdmin, onUpdateHero }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTag, setEditTag] = useState(hero.tag);
  const [editTitle, setEditTitle] = useState(hero.title);
  const [editDesc, setEditDesc] = useState(hero.description);
  const [uploading, setUploading] = useState(false);

  const handleSaveText = async () => {
    if (!onUpdateHero) return;
    await onUpdateHero({
      tag: editTag,
      title: editTitle,
      description: editDesc,
    });
    setIsEditing(false);
  };

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateHero) return;
    try {
      setUploading(true);
      const res = await api.uploadImage(file);
      await onUpdateHero({ bannerImage: res.url });
    } catch (err) {
      alert('上传背景图失败: ' + err);
    } finally {
      setUploading(false);
    }
  };

  const percentage = hero.storageTotal > 0
    ? Math.min(100, (hero.storageUsed / hero.storageTotal) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-emerald-900/10 shadow-xs mb-8 transition-all">
      {/* Background with subtle gradient & customizable image */}
      <div className="absolute inset-0 z-0">
        <img
          src={hero.bannerImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'}
          alt="Banner background"
          className="w-full h-full object-cover object-center opacity-18 filter saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-emerald-50/70" />
      </div>

      <div className="relative z-10 px-6 sm:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-3xl space-y-3">
          {/* Tag & Admin Quick Edit Button */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
              {hero.tag}
            </span>
            {isAdmin && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] text-emerald-600 hover:text-emerald-800 underline font-medium"
              >
                {isEditing ? '取消修改' : '修改首页文案'}
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2 bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
              <input
                type="text"
                value={editTag}
                onChange={e => setEditTag(e.target.value)}
                placeholder="顶部标签"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
              />
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="主标题"
                className="w-full text-sm font-bold px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
              />
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="副标题描述"
                rows={2}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSaveText}
                  className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700"
                >
                  保存文案
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {hero.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {hero.description}
              </p>
            </>
          )}

          {/* Admin Custom Local Background Photo Uploader */}
          {isAdmin && (
            <div className="pt-1 flex items-center space-x-2 text-xs">
              <label className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white/90 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer transition shadow-2xs">
                <Upload className="w-3 h-3 text-emerald-600" />
                <span>{uploading ? '上传中...' : '自定义首页背景照片 (支持本地图片)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadBg}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>

        {/* Real Storage Capacity Indicator (Total and Used, Defaults to 0 when unattached) */}
        <div className="w-full md:w-auto flex-shrink-0 bg-white/90 backdrop-blur-xs p-4 rounded-lg border border-emerald-900/10 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">存储中枢容量</span>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-700">
              {percentage}%
            </span>
          </div>

          <div className="w-48 bg-emerald-100 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, Number(percentage)))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>已用: <strong className="text-slate-800 font-semibold">{hero.storageUsed} MB</strong></span>
            <span>总计: <strong className="text-slate-800 font-semibold">{hero.storageTotal > 0 ? `${(hero.storageTotal / 1024).toFixed(1)} GB` : '0 MB (未接入)'}</strong></span>
          </div>

          <div className="mt-2 pt-2 border-t border-emerald-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>D1 / R2 / 本地引擎</span>
            <span className="text-emerald-700 font-medium">真实数值校验</span>
          </div>
        </div>
      </div>
    </div>
  );
};
