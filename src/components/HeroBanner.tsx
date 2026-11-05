import React from 'react';
import { HeroConfig } from '../types';
import { Cloud, Sparkles, Database } from 'lucide-react';

interface HeroBannerProps {
  hero: HeroConfig;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ hero }) => {
  const percentage = Math.min(100, Math.round((hero.storageUsed / hero.storageTotal) * 100));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-emerald-600 text-white shadow-xl mb-10 transition-all">
      {/* Background visual texture & overlay */}
      <div
        className="absolute inset-0 opacity-15 mix-blend-overlay bg-cover bg-center"
        style={{ backgroundImage: `url(${hero.bannerImage})` }}
      />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left: Tag, Title, Description */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>{hero.tag}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-sm">
            {hero.title}
          </h1>

          <p className="text-sm sm:text-base text-rose-50/90 leading-relaxed font-normal">
            {hero.description}
          </p>
        </div>

        {/* Right: Storage & Cloud Status Badge */}
        <div className="w-full md:w-auto bg-black/25 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[280px] shadow-lg">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-emerald-200">
              <Database className="w-4 h-4 text-emerald-300" />
              <span>D1 / R2 云端存储池</span>
            </span>
            <span className="text-rose-100 font-mono">{percentage}% 已用</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2.5 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2.5 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(percentage, 2)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/80 font-mono">
            <span>已使用: {hero.storageUsed} MB</span>
            <span>总量: {(hero.storageTotal / 1024).toFixed(1)} GB</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-100">
            <span className="inline-flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
              <span>多云边缘同步</span>
            </span>
            <span className="bg-emerald-500/30 px-2 py-0.5 rounded text-[10px] text-emerald-200 border border-emerald-400/30">
              Zero LocalStorage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
