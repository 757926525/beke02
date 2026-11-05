import React, { useState } from 'react';
import { MediaTrack } from '../types';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Film, Radio } from 'lucide-react';

export const MediaView: React.FC = () => {
  const [tracks] = useState<MediaTrack[]>([
    {
      id: 'track-1',
      title: '青丘夜雨 · 古琴清泉',
      artist: '白狐雅集',
      duration: '04:18',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'track-2',
      title: '灵音绕梁 · 空灵仙韵',
      artist: '国风清心乐',
      duration: '03:45',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      cover: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'track-3',
      title: '极客心流 · Lo-Fi 编码电台',
      artist: 'Cloud Hacker Beats',
      duration: '05:12',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80',
    },
  ]);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((currentTrackIndex + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((currentTrackIndex - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">媒体影音 · 沉浸视听</h2>
        <p className="text-xs text-slate-500 mt-0.5">流媒体播放器 · Lo-Fi 编码专注伴侣</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audio Player Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-rose-100/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-lg border border-slate-100 shrink-0">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105 rotate-1' : ''}`}
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Music className="w-8 h-8 text-white/80" />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Now Playing
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2 truncate">{currentTrack.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{currentTrack.artist}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-slate-400 mt-3 font-mono">
                <span>01:24</span>
                <div className="w-32 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '38%' }} />
                </div>
                <span>{currentTrack.duration}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-6 mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
              title="上一曲"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 transition-transform active:scale-95"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
              title="下一曲"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Playlist (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-rose-100/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-rose-500" />
            <span>精选伴奏曲目</span>
          </h3>

          <div className="space-y-2">
            {tracks.map((track, idx) => {
              const active = idx === currentTrackIndex;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? 'bg-rose-50/70 border-rose-200 text-rose-600 font-semibold'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className="w-5 text-center text-xs font-mono text-slate-400">
                      {idx + 1}
                    </span>
                    <img src={track.cover} alt={track.title} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="truncate">
                      <p className="text-xs truncate">{track.title}</p>
                      <p className="text-[10px] text-slate-400">{track.artist}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 ml-2">{track.duration}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
