import React, { useState, useEffect } from 'react';
import { MediaTrack } from '../types';
import {
  Film,
  Music,
  Play,
  Pause,
  Upload,
  Trash2,
  Volume2,
  Video,
  LayoutGrid,
  List,
  Columns,
  Grid3X3
} from 'lucide-react';
import { api } from '../api';

interface MediaViewProps {
  isAdmin?: boolean;
}

export const MediaView: React.FC<MediaViewProps> = ({ isAdmin }) => {
  const [tracks, setTracks] = useState<MediaTrack[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState<MediaTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'medium' | 'small' | 'large' | 'detail'>('medium');
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    try {
      const data = await api.getMedia();
      setTracks(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await api.uploadFile(file);
      const isVideo = file.type.startsWith('video/');
      await api.addMediaTrack({
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: '站长',
        url: res.url,
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        type: isVideo ? 'video' : 'audio',
        duration: '03:45'
      });
      fetchMedia();
    } catch (err: any) {
      alert('上传媒体失败: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('确认删除该音视频？')) return;
    await api.deleteMediaTrack(id);
    setTracks(prev => prev.filter(t => t.id !== id));
    if (currentPlaying?.id === id) {
      setCurrentPlaying(null);
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ribbon */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-emerald-900/10 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Film className="w-5 h-5 text-emerald-600" />
            <span>媒体影音 · 视听鉴赏中心</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            原生 HTML5 音频与视频播放引擎，支持自建本地存储与 R2 流式加速。
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isAdmin && (
            <label className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 cursor-pointer shadow-xs transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? '上传中...' : '上传音视频文件'}</span>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleUploadMedia}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}

          {/* 4 View Modes */}
          <div className="flex items-center border border-slate-200 rounded-md p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('small')}
              className={`p-1 rounded ${viewMode === 'small' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-400'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('medium')}
              className={`p-1 rounded ${viewMode === 'medium' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('large')}
              className={`p-1 rounded ${viewMode === 'large' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-400'}`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`p-1 rounded ${viewMode === 'detail' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-400'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Player (Sticky / Top) */}
      {currentPlaying && (
        <div className="p-4 bg-emerald-950 text-white rounded-xl shadow-md border border-emerald-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <img src={currentPlaying.cover} alt={currentPlaying.title} className="w-12 h-12 rounded object-cover border border-emerald-700" />
            <div className="truncate">
              <div className="font-bold text-sm truncate">{currentPlaying.title}</div>
              <div className="text-xs text-emerald-300">{currentPlaying.artist}</div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            {currentPlaying.type === 'video' ? (
              <video controls autoPlay src={currentPlaying.url} className="w-full rounded max-h-52 bg-black" />
            ) : (
              <audio controls autoPlay src={currentPlaying.url} className="w-full" />
            )}
          </div>
        </div>
      )}

      {/* Tracks Grid */}
      <div className={
        viewMode === 'small'
          ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3'
          : (viewMode === 'large'
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
            : (viewMode === 'detail' ? 'space-y-2' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'))
      }>
        {tracks.map(track => {
          if (viewMode === 'detail') {
            return (
              <div
                key={track.id}
                onClick={() => setCurrentPlaying(track)}
                className="p-3 bg-white rounded-lg border border-emerald-900/10 hover:border-emerald-500 shadow-2xs cursor-pointer flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-3">
                  {track.type === 'video' ? <Video className="w-4 h-4 text-emerald-600" /> : <Music className="w-4 h-4 text-emerald-600" />}
                  <span className="font-bold text-xs text-slate-800">{track.title}</span>
                  <span className="text-xs text-slate-400">· {track.artist}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span>{track.duration}</span>
                  {isAdmin && (
                    <button
                      onClick={e => handleDeleteMedia(track.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={track.id}
              onClick={() => setCurrentPlaying(track)}
              className="bg-white rounded-lg border border-emerald-900/10 overflow-hidden shadow-2xs hover:shadow-md cursor-pointer transition flex flex-col group"
            >
              <div className="relative h-36 overflow-hidden">
                <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Play className="w-10 h-10 text-white fill-current" />
                </div>
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white">
                  {track.type}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="truncate">
                  <h4 className="font-bold text-xs text-slate-800 truncate">{track.title}</h4>
                  <p className="text-[11px] text-slate-400">{track.artist} · {track.duration}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={e => handleDeleteMedia(track.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
