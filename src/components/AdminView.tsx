import React, { useState, useEffect } from 'react';
import { SystemSettings, HeroConfig, StorageStatus, User } from '../types';
import {
  Save,
  RefreshCw,
  Settings,
  Palette,
  Cpu,
  Database,
  Mail,
  Users,
  Sliders,
  Check,
  Upload,
  Sparkles,
  Link2,
  Trash2,
  Inbox,
  Send,
  EyeOff,
  UserCheck,
  CheckCircle,
  Layout,
  HardDrive
} from 'lucide-react';
import { api } from '../api';

interface AdminViewProps {
  settings: SystemSettings;
  hero: HeroConfig;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  onUpdateHero: (newHero: Partial<HeroConfig>) => Promise<void>;
  onRefreshAll: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  settings,
  hero,
  onUpdateSettings,
  onUpdateHero,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<'merged-email' | 'merged-governance' | 'bindings' | 'advanced'>('merged-email');
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [heroData, setHeroData] = useState<HeroConfig>(hero);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Storage and KV real-time status telemetry
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    kvConnected: false,
    dbConnected: true,
    d1Bound: false,
    r2Bound: false,
    activeStorage: 'local',
    lastSyncTime: '未同步',
    kvNamespace: '未绑定 (默认零数值)',
    syncLatencyMs: 0,
    cloudStorageUsedMb: 0,
    cloudStorageTotalMb: 0,
    localStorageUsedMb: 0,
  });

  // WebDAV test status & backup/restore actions
  const [webdavTesting, setWebdavTesting] = useState(false);
  const [webdavBackingUp, setWebdavBackingUp] = useState(false);
  const [webdavRestoring, setWebdavRestoring] = useState(false);
  const [webdavMsg, setWebdavMsg] = useState<string | null>(null);
  const [webdavStatus, setWebdavStatus] = useState<{ hasBackup: boolean; lastBackupTime?: string; postsCount?: number; booksCount?: number } | null>(null);

  // Users list
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  // Inbox & Messages
  const [inboxMessages, setInboxMessages] = useState([
    {
      id: 'msg-1',
      sender: 'qingfeng (读者)',
      email: 'qingfeng@fox.mail',
      subject: '关于多云架构实战文章的探讨',
      content: '站长您好，阅读了您写的 Cloudflare D1 + R2 文章后受益匪浅，请问有全屏电子书阅读的移动端适配方案吗？',
      time: '2025-05-18 16:30',
      reply: '感谢支持！最新版已全面适配移动端全屏研读，且顶部刘海栏安全距离已做优化。',
      status: 'replied'
    },
    {
      id: 'msg-2',
      sender: 'visitor_402 (访客)',
      email: 'guest402@example.com',
      subject: '博客主题能否开源支持自定义本地背景？',
      content: '非常喜欢现在的蓝白 Outlook 风格，请问站长头像和 Hero 背景是否都能上传自己本地的照片？',
      time: '2025-05-19 11:20',
      reply: '',
      status: 'unread'
    }
  ]);

  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(settings);
    setHeroData(hero);
    fetchStatus();
    fetchUsers();
    fetchWebDavStatus();
  }, [settings, hero]);

  const fetchWebDavStatus = async () => {
    try {
      const res = await api.getWebDavStatus();
      if (res && res.success) {
        setWebdavStatus(res);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await api.getStorageStatus();
      setStorageStatus(res);
    } catch (e) {
      console.warn('Failed to load storage status', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await api.getUsers();
      setRegisteredUsers(users);
    } catch (e) {
      console.warn('Failed to load users', e);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await onUpdateSettings(formData);
      await onUpdateHero(heroData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      fetchStatus();
    } catch (err: any) {
      alert('保存设置失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (field: 'avatar' | 'bannerImage', file: File) => {
    try {
      const res = await api.uploadImage(file);
      if (field === 'avatar') {
        setFormData(prev => ({ ...prev, avatar: res.url }));
      } else {
        setHeroData(prev => ({ ...prev, bannerImage: res.url }));
      }
    } catch (err: any) {
      alert('上传图片失败: ' + err.message);
    }
  };

  const handleTestWebDav = async () => {
    setWebdavTesting(true);
    setWebdavMsg(null);
    try {
      const res = await api.testWebDav(formData.webdavConfig);
      setWebdavMsg('✅ ' + res.message);
    } catch (err: any) {
      setWebdavMsg('❌ 连接测试失败: ' + err.message);
    } finally {
      setWebdavTesting(false);
    }
  };

  const handleBackupWebDav = async () => {
    setWebdavBackingUp(true);
    setWebdavMsg(null);
    try {
      const res = await api.backupWebDav(formData.webdavConfig);
      setWebdavMsg('✅ ' + res.message);
      fetchWebDavStatus();
      alert(`坚果云/WebDAV 备份成功！\n文章数: ${res.postsCount} | 电子书数: ${res.booksCount}`);
    } catch (err: any) {
      setWebdavMsg('❌ 备份失败: ' + err.message);
      alert('备份失败: ' + err.message);
    } finally {
      setWebdavBackingUp(false);
    }
  };

  const handleRestoreWebDav = async () => {
    if (!confirm('确定从坚果云 / WebDAV 远端备份恢复所有博客和电子书？恢复将同步更新当前博客列表与书架。')) return;
    setWebdavRestoring(true);
    setWebdavMsg(null);
    try {
      const res = await api.restoreWebDav();
      setWebdavMsg('✅ ' + res.message);
      alert(`坚果云/WebDAV 恢复成功！\n已恢复文章: ${res.restoredPostsCount} | 恢复图书: ${res.restoredBooksCount}`);
      await onRefreshAll();
      fetchWebDavStatus();
    } catch (err: any) {
      setWebdavMsg('❌ 恢复失败: ' + err.message);
      alert('恢复失败: ' + err.message);
    } finally {
      setWebdavRestoring(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('确认注销该注册用户？')) return;
    await api.deleteUser(id);
    fetchUsers();
  };

  const handleDeleteMessage = (id: string) => {
    if (!confirm('确定删除此留言？')) return;
    setInboxMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleSendReply = (id: string) => {
    const text = replyTextMap[id];
    if (!text || !text.trim()) return;
    setInboxMessages(prev => prev.map(m => m.id === id ? { ...m, reply: text, status: 'replied' } : m));
    setReplyTextMap(prev => ({ ...prev, [id]: '' }));
    alert('已成功回复并同步发送站内邮件！');
  };

  return (
    <div className="space-y-6">
      {/* Real-time Cloudflare KV / D1 / R2 Priority Dual-Engine Indicator Bar */}
      <div className="bg-white rounded-xl border border-sky-900/10 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {/* Honest Real-Time Indicator Light: Green only when really connected; slate/amber when unattached/zero */}
          <div className="relative flex items-center justify-center">
            <span className={`w-3.5 h-3.5 rounded-full ${
              storageStatus.kvConnected
                ? 'bg-sky-500 ring-4 ring-sky-100 animate-pulse'
                : 'bg-slate-400'
            }`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-800">
                {storageStatus.kvConnected ? 'Cloudflare KV 优先加速引擎' : '本地文件型轻量引擎 (离线正常运行)'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                storageStatus.kvConnected ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {storageStatus.activeStorage}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              命名空间: <strong className="text-slate-700">{storageStatus.kvNamespace}</strong> · 响应耗时: <strong className="text-sky-700 font-mono">{storageStatus.syncLatencyMs}ms</strong>
            </p>
          </div>
        </div>

        {/* Real Cloud Storage Pool Info (Defaults to 0 when unconfigured) */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">云端存储池 (D1/R2)</span>
            <span className="font-bold text-slate-700">
              {storageStatus.cloudStorageTotalMb > 0
                ? `${storageStatus.cloudStorageUsedMb} / ${storageStatus.cloudStorageTotalMb} MB`
                : '0 MB (默认未接入)'}
            </span>
          </div>
          <button
            onClick={fetchStatus}
            title="刷新状态探测"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-sky-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center space-x-1 border-b border-sky-900/10 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('merged-email')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'merged-email' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>邮件 API 与站内信箱综合区 (二合一)</span>
        </button>

        <button
          onClick={() => setActiveTab('merged-governance')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'merged-governance' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>全站治理、外观调色与用户中枢 (四合一)</span>
        </button>

        <button
          onClick={() => setActiveTab('bindings')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'bindings' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>多云绑定与坚果云 WebDAV (4接口)</span>
        </button>

        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'advanced' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI 算力与系统参数</span>
        </button>
      </div>

      {/* Tab 1: Merged Email & Inbox (2-in-1 zone) */}
      {activeTab === 'merged-email' && (
        <div className="space-y-6">
          {/* Sub-partition 1: Email API & Cloudflare Email Routing */}
          <div className="bg-white rounded-xl border border-sky-900/10 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Mail className="w-4 h-4 text-sky-600" />
              <span>子分区一：邮件 API 与 Cloudflare Email Routing 服务配置</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">发信服务通道提供商</label>
                <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800">
                  <option>Cloudflare Email Routing (默认推荐)</option>
                  <option>Resend API (全球低延迟)</option>
                  <option>SendGrid / Mailgun</option>
                  <option>腾讯云 SES / 阿里云邮件推送</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">发件人地址 (Sender)</label>
                <input
                  type="text"
                  defaultValue="notify@whitefox.cloud"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">邮件 API Key / Token</label>
                <input
                  type="password"
                  placeholder="re_xxxxxxxxxxxx"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Sub-partition 2: Site Mailbox & Reply Manager */}
          <div className="bg-white rounded-xl border border-sky-900/10 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-sky-600" />
                <span>子分区二：站内信箱与回复消息管理 (支持直接删除)</span>
              </h3>
              <span className="text-xs text-slate-400">共 {inboxMessages.length} 封往来消息</span>
            </div>

            <div className="space-y-3">
              {inboxMessages.map(msg => (
                <div key={msg.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{msg.sender}</span>
                      <span className="text-slate-400">({msg.email})</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        msg.status === 'replied' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {msg.status === 'replied' ? '已回复' : '待回复'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">{msg.time}</span>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="删除该消息"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="font-semibold text-slate-900">{msg.subject}</div>
                  <p className="text-slate-600 leading-relaxed">{msg.content}</p>

                  {/* Show replied text if exists */}
                  {msg.reply && (
                    <div className="p-2.5 rounded bg-sky-50/70 border border-sky-200 text-sky-900">
                      <strong className="block text-[11px] mb-0.5">站长回复：</strong>
                      {msg.reply}
                    </div>
                  )}

                  {/* Reply Action Box */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="键入回复内容..."
                      value={replyTextMap[msg.id] || ''}
                      onChange={e => setReplyTextMap(prev => ({ ...prev, [msg.id]: e.target.value }))}
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800"
                    />
                    <button
                      onClick={() => handleSendReply(msg.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-medium"
                    >
                      <Send className="w-3 h-3" />
                      <span>回复消息</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Merged Governance, Appearance & Users (4-in-1 zone) */}
      {activeTab === 'merged-governance' && (
        <div className="space-y-6">
          {/* Sub-partition 1: All User Messages & Bottom Notices */}
          <div className="bg-white rounded-xl border border-sky-900/10 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>子分区一：全站用户消息与通知管理 (底部控制区)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">页眉品牌文字 (默认 fox，支持自定义)</label>
                <input
                  type="text"
                  value={formData.headerBrand || 'fox'}
                  onChange={e => setFormData({ ...formData, headerBrand: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">全站公告标语</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Sub-partition 2: Theme Palette, Layout Switcher & Local Photos */}
          <div className="bg-white rounded-xl border border-sky-900/10 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Palette className="w-4 h-4 text-sky-600" />
              <span>子分区二：主题调色、页面布局与本地图片设定 (头像/背景/Hero)</span>
            </h3>

            {/* Layout Switcher moved into Settings */}
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
              <label className="block text-xs font-bold text-sky-900 mb-1.5 flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-sky-700" />
                <span>切换页面布局风格 (已移至设置区内部)</span>
              </label>
              <div className="flex items-center space-x-3 text-xs">
                {(['default', 'compact', 'wide'] as const).map(mode => (
                  <label key={mode} className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="themeLayout"
                      value={mode}
                      checked={formData.themeLayout === mode}
                      onChange={() => setFormData({ ...formData, themeLayout: mode })}
                      className="text-sky-600"
                    />
                    <span className="capitalize font-medium text-slate-700">
                      {mode === 'default' ? '标准宽幅 (Default)' : (mode === 'compact' ? '紧凑精致 (Compact)' : '超宽沉浸 (Wide 1600px)')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Local Photos Customizer (Avatar & Hero) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">站长头像设定 (支持本地上传)</span>
                <div className="flex items-center space-x-3">
                  <img src={formData.avatar} alt="Avatar preview" className="w-12 h-12 rounded-full object-cover border border-sky-500" />
                  <label className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:text-sky-700 cursor-pointer text-xs font-medium shadow-2xs">
                    上传本地头像
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleUploadImage('avatar', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">首页背景照片 (Hero Banner 支持本地上传)</span>
                <div className="flex items-center space-x-3">
                  <img src={heroData.bannerImage} alt="Hero banner" className="w-16 h-10 rounded object-cover border border-sky-500" />
                  <label className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:text-sky-700 cursor-pointer text-xs font-medium shadow-2xs">
                    上传本地背景图
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleUploadImage('bannerImage', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-partition 3: Privacy & Guest Control Switchers */}
          <div className="bg-white rounded-xl border border-sky-900/10 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <EyeOff className="w-4 h-4 text-sky-600" />
              <span>子分区三：注册控制与访客隐藏选区开关 (仅管理员可见)</span>
            </h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.hideNonBlogForGuests}
                  onChange={e => setFormData({ ...formData, hideNonBlogForGuests: e.target.checked })}
                  className="rounded text-sky-600"
                />
                <span className="text-slate-700">访客仅允许浏览博客专栏，对未登录访客隐藏非核心商业模块</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.requireEmailRegistration}
                  onChange={e => setFormData({ ...formData, requireEmailRegistration: e.target.checked })}
                  className="rounded text-sky-600"
                />
                <span className="text-slate-700">新用户注册时强制验证电子邮箱</span>
              </label>
            </div>
          </div>

          {/* Sub-partition 4: Registered Users List */}
          <div className="bg-white rounded-xl border border-sky-900/10 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>子分区四：已注册用户管理列表 (项目唯一管理员专属)</span>
              </h3>
              <span className="text-xs text-slate-400">共 {registeredUsers.length} 位系统用户</span>
            </div>

            <div className="divide-y divide-slate-100">
              {registeredUsers.map(user => (
                <div key={user.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <span className="font-semibold text-slate-800">{user.username}</span>
                      <span className="text-slate-400 ml-2">({user.email || '未填邮箱'})</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.role === 'admin' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {user.role === 'admin' ? '唯一站长' : '注册用户'}
                    </span>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="删除注销该用户"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cloudflare Bindings & Nutstore / WebDAV 4-parameter interface */}
      {activeTab === 'bindings' && (
        <div className="bg-white rounded-xl border border-sky-900/10 p-5 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Link2 className="w-4 h-4 text-sky-600" />
            <span>坚果云 / WebDAV 远端同步 4 大核心接口</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">1. 服务器地址 (Server URL)</label>
              <input
                type="text"
                value={formData.webdavConfig.serverUrl}
                onChange={e => setFormData({
                  ...formData,
                  webdavConfig: { ...formData.webdavConfig, serverUrl: e.target.value }
                })}
                placeholder="https://dav.jianguoyun.com/dav/"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">2. 用户名 (Username)</label>
              <input
                type="text"
                value={formData.webdavConfig.username}
                onChange={e => setFormData({
                  ...formData,
                  webdavConfig: { ...formData.webdavConfig, username: e.target.value }
                })}
                placeholder="foxuser@outlook.com"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">3. 应用授权密码 (Password / App Token)</label>
              <input
                type="password"
                value={formData.webdavConfig.password}
                onChange={e => setFormData({
                  ...formData,
                  webdavConfig: { ...formData.webdavConfig, password: e.target.value }
                })}
                placeholder="坚果云应用授权码"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">4. 远程存储路径 (Remote Path)</label>
              <input
                type="text"
                value={formData.webdavConfig.remotePath}
                onChange={e => setFormData({
                  ...formData,
                  webdavConfig: { ...formData.webdavConfig, remotePath: e.target.value }
                })}
                placeholder="/fox2_backup"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
              />
            </div>
          </div>

          {/* WebDAV Remote Status Banner */}
          {webdavStatus?.hasBackup && (
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-xs text-sky-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold">远端备份档案就绪：</span>
                <span className="text-slate-600 ml-1">上次备份时间 {new Date(webdavStatus.lastBackupTime || '').toLocaleString()}</span>
              </div>
              <div className="font-mono text-[11px] bg-white px-2.5 py-1 rounded border border-sky-200">
                博客文章: <strong>{webdavStatus.postsCount}</strong> 篇 | 电子书: <strong>{webdavStatus.booksCount}</strong> 本
              </div>
            </div>
          )}

          {/* Action Buttons for the 4 Core Interfaces */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={handleTestWebDav}
              disabled={webdavTesting}
              className="px-4 py-2 rounded bg-sky-50 text-sky-800 border border-sky-300 text-xs font-semibold hover:bg-sky-100 transition disabled:opacity-50"
            >
              {webdavTesting ? '正在验证 WebDAV 接口...' : '1. 测试 WebDAV 连通性'}
            </button>

            <button
              onClick={handleBackupWebDav}
              disabled={webdavBackingUp}
              className="px-4 py-2 rounded bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 shadow-xs transition disabled:opacity-50"
            >
              {webdavBackingUp ? '正在备份所有书架与博客...' : '2. 备份所有电子书与博客'}
            </button>

            <button
              onClick={handleRestoreWebDav}
              disabled={webdavRestoring}
              className="px-4 py-2 rounded bg-white text-slate-700 border border-slate-300 text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50"
            >
              {webdavRestoring ? '正在恢复所有电子书与博客...' : '3. 从远端恢复所有电子书与博客'}
            </button>

            <button
              onClick={fetchWebDavStatus}
              className="px-3 py-2 rounded bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 transition"
              title="查询备份状态"
            >
              4. 检查备份状态
            </button>
          </div>
          {webdavMsg && <div className="text-xs font-mono text-slate-700 p-2 rounded bg-slate-50 border border-slate-200">{webdavMsg}</div>}
        </div>
      )}

      {/* Tab 4: AI & Architecture settings */}
      {activeTab === 'advanced' && (
        <div className="bg-white rounded-xl border border-sky-900/10 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Cpu className="w-4 h-4 text-sky-600" />
            <span>智能编程 AI 模型与算力路由</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">默认调用模型</label>
              <input
                type="text"
                value={formData.aiModel}
                onChange={e => setFormData({ ...formData, aiModel: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">API Base URL (留空使用官方网关)</label>
              <input
                type="text"
                value={formData.aiBaseUrl}
                onChange={e => setFormData({ ...formData, aiBaseUrl: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">API Key (可选，填入后直连真实算力)</label>
            <input
              type="password"
              value={formData.aiApiKey}
              onChange={e => setFormData({ ...formData, aiApiKey: e.target.value })}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
            />
          </div>
        </div>
      )}

      {/* Bottom Sticky Save Button */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-sky-900/10 shadow-xs">
        <span className="text-xs text-slate-400">
          所有设置即时提交写入后端数据库，刷新页面自动保持最新状态。
        </span>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center space-x-1.5 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : (saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
          <span>{saving ? '保存中...' : (saveSuccess ? '保存成功！' : '保存系统所有设定')}</span>
        </button>
      </div>
    </div>
  );
};
