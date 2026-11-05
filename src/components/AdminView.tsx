import React, { useState } from 'react';
import { SystemSettings, HeroConfig } from '../types';
import {
  Settings,
  Database,
  Cloud,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Save,
  Server,
  Key,
  Globe,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../api';

interface AdminViewProps {
  settings: SystemSettings;
  hero: HeroConfig;
  onUpdateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  onUpdateHero: (hero: Partial<HeroConfig>) => Promise<void>;
  onRefreshAll: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  settings,
  hero,
  onUpdateSettings,
  onUpdateHero,
  onRefreshAll,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [heroData, setHeroData] = useState<HeroConfig>({ ...hero });
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      await onUpdateSettings(formData);
      await onUpdateHero(heroData);
      setStatusMsg({ type: 'success', text: '系统配置已成功保存并立即生效！' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: '保存配置失败，请检查网络或服务端响应。' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const fullData = await api.exportData();
      const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fox2-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMsg({ type: 'success', text: '全站数据备份文件已导出！' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: '导出备份失败' });
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await api.importData(parsed);
      await onRefreshAll();
      setStatusMsg({ type: 'success', text: '全站数据导入同步成功！页面已刷新。' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: '备份文件解析导入失败，请确保格式正确。' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">系统管理设置 · 控制台</h2>
        <p className="text-xs text-slate-500 mt-0.5">多云边缘部署管理 · 数据备份与迁移 · AI 引擎参数配置</p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between animate-fadeIn ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic & Hero Settings */}
        <div className="bg-white rounded-3xl border border-rose-100/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900">博客基本信息与横幅</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">站点名称</label>
            <input
              type="text"
              value={formData.siteName}
              onChange={e => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">站长昵称</label>
            <input
              type="text"
              value={formData.authorName}
              onChange={e => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">横幅主标题 (Hero Title)</label>
            <input
              type="text"
              value={heroData.title}
              onChange={e => setHeroData({ ...heroData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">横幅意境口号 (Hero Tag)</label>
            <input
              type="text"
              value={heroData.tag}
              onChange={e => setHeroData({ ...heroData, tag: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">横幅详细描述</label>
            <textarea
              rows={3}
              value={heroData.description}
              onChange={e => setHeroData({ ...heroData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400"
            />
          </div>
        </div>

        {/* AI & Multi-cloud Settings */}
        <div className="bg-white rounded-3xl border border-rose-100/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900">AI 编程助手与多云参数</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">AI 默认模型</label>
            <input
              type="text"
              value={formData.aiModel}
              onChange={e => setFormData({ ...formData, aiModel: e.target.value })}
              placeholder="@cf/deepseek-ai/deepseek-r1-distill-qwen-32b"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">AI API Key (选填，留空使用内置智能引擎)</label>
            <input
              type="password"
              value={formData.aiApiKey}
              onChange={e => setFormData({ ...formData, aiApiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">AI Base URL</label>
            <input
              type="text"
              value={formData.aiBaseUrl}
              onChange={e => setFormData({ ...formData, aiBaseUrl: e.target.value })}
              placeholder="https://api.deepseek.com/v1"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">R2 / COS 存储桶名称</label>
            <input
              type="text"
              value={formData.r2BucketName}
              onChange={e => setFormData({ ...formData, r2BucketName: e.target.value })}
              placeholder="fox-blog-assets"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">WebDAV 远端同步 URL</label>
            <input
              type="text"
              value={formData.webdavUrl}
              onChange={e => setFormData({ ...formData, webdavUrl: e.target.value })}
              placeholder="https://dav.jianguoyun.com/dav/"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>
        </div>

        {/* Action submit button */}
        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-emerald-600 text-white font-bold text-xs shadow-md shadow-rose-200 hover:opacity-95 flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? '保存中...' : '保存并应用所有设置'}</span>
          </button>
        </div>
      </form>

      {/* Deployment Hub & Guides */}
      <div className="bg-white rounded-3xl border border-rose-100/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-6">
          <Server className="w-5 h-5 text-rose-500" />
          <h3 className="text-base font-bold text-slate-900">多云极速部署指引中枢 (Cloudflare / 腾讯云 / 阿里云 / Vercel)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60 space-y-2">
            <span className="font-bold text-xs text-orange-900 flex items-center space-x-1">
              <span className="text-base">⚡</span>
              <span>Cloudflare Pages (首选推荐)</span>
            </span>
            <p className="text-[11px] text-orange-800 leading-relaxed">
              1. 登录 Cloudflare Dashboard；<br />
              2. 导入 GitHub 仓库 <code>fox2</code>；<br />
              3. 构建命令填 <code>npm run build</code>，输出目录填 <code>dist</code>；<br />
              4. 享用全球 Anycast 边缘免流分发。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/60 space-y-2">
            <span className="font-bold text-xs text-blue-900 flex items-center space-x-1">
              <span className="text-base">🐧</span>
              <span>腾讯云 EdgeOne / Serverless</span>
            </span>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              1. 登录腾讯云控制台；<br />
              2. 进入 EdgeOne Pages 或 Web 托管；<br />
              3. 绑定 Git 仓库，构建命令 <code>npm run build</code>；<br />
              4. 国内极速访问与备案解析支持。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
            <span className="font-bold text-xs text-amber-900 flex items-center space-x-1">
              <span className="text-base">☁️</span>
              <span>阿里云 ESA / FC 函数</span>
            </span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              1. 进入阿里云边缘安全加速 ESA；<br />
              2. 部署静态网站或边缘函数；<br />
              3. 可直接上传压缩包 <code>dist.zip</code> 一键上线。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-2">
            <span className="font-bold text-xs text-emerald-900 flex items-center space-x-1">
              <span className="text-base">▲</span>
              <span>Vercel / Docker 独立部署</span>
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              - Vercel: 自动检测 <code>vercel.json</code> 一键拉取部署；<br />
              - 独立服务器: 执行 <code>docker-compose up -d</code> 即可启动全栈持久化容器。
            </p>
          </div>
        </div>

        {/* Direct Upload Package Explanation */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="font-bold flex items-center space-x-2 text-slate-900">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>关于“直接上传压缩包”部署方案的获取与使用说明：</span>
          </div>
          <p className="leading-relaxed">
            如不想绑定 Git 仓库，可在本地终端执行：<br />
            <code className="bg-slate-200 px-2 py-0.5 rounded text-rose-600 font-mono font-bold">npm run build:pages</code><br />
            脚本将自动执行静态优化打包，并在项目根目录生成专用的 <code className="font-mono text-emerald-600 font-bold">dist-pages.zip</code> 离线包。随后打开 Cloudflare Pages 控制台，选择 <strong>“Direct Upload (直接上传)”</strong>，将该压缩包解压后的文件夹或 zip 拖拽上传即可 0 秒极速发布，杜绝任何环境编译报错。
          </p>
        </div>
      </div>

      {/* Data Migration & Backup Sync (Serverless Zero LocalStorage) */}
      <div className="bg-white rounded-3xl border border-rose-100/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Database className="w-4 h-4 text-rose-500" />
            <span>全站数据备份与跨云迁移</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            全量导出或导入文章、书架进度、订单、网盘文件索引及设置，轻松在多台服务器或边缘集群间迁移。
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>导入备份 JSON</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出全站备份</span>
          </button>
        </div>
      </div>
    </div>
  );
};
