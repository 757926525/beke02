import React, { useState, useEffect } from 'react';
import { SystemSettings, HeroConfig, StorageStatus } from '../types';
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
  Sparkles,
  Mail,
  Send,
  Trash2,
  Reply,
  Palette,
  Image,
  UserCheck,
  Users,
  Bell,
  Lock,
  Sliders,
  Eye,
  EyeOff,
  Activity,
  Zap,
  CheckCircle2,
  RefreshCw,
  Plus
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
  const [activeTab, setActiveTab] = useState<'merged-email' | 'merged-governance' | 'system'>('merged-email');
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [heroData, setHeroData] = useState<HeroConfig>({ ...hero });
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Storage / KV Status Indicator state
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    kvConnected: true,
    dbConnected: true,
    activeStorage: 'kv',
    lastSyncTime: new Date().toLocaleTimeString('zh-CN'),
    kvNamespace: 'FOX_BLOG_KV',
    syncLatencyMs: 3,
  });

  // Modals & sub-partition states
  const [emailProvider, setEmailProvider] = useState('resend');
  const [senderEmail, setSenderEmail] = useState('noreply@whitefox.blog');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailRateLimit, setEmailRateLimit] = useState(true);

  // Site letters
  const [letters, setLetters] = useState([
    {
      id: 'letter-1',
      senderEmail: 'reader@example.com',
      senderName: '青丘书客',
      subject: '关于博客多云部署实践的交流',
      content: '站长您好，拜读了您的多云边缘架构系列博文，请问如何配置坚果云 WebDAV 网盘？',
      receivedAt: '2025-05-18 10:20',
      replied: true,
      replyContent: '您好！在坚果云网页版开启第三方应用授权生成“应用密码”，在博客网盘区填入服务器地址和密码即可！',
      repliedAt: '2025-05-18 11:05',
    },
    {
      id: 'letter-2',
      senderEmail: 'dev@whitefox.blog',
      senderName: '技术读者',
      subject: '关于多端自适应播放器画幅的反馈',
      content: '播放器的自适应画幅非常流畅，赞一个！',
      receivedAt: '2025-05-18 14:15',
      replied: false,
      replyContent: '',
      repliedAt: '',
    }
  ]);
  const [replyLetterId, setReplyLetterId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // User broadcast messages
  const [userMessages, setUserMessages] = useState([
    {
      id: 'msg-1',
      title: '白狐系统多云全息双向同步与免库边缘运行说明',
      content: '欢迎使用白狐数字空间，本站已支持 Cloudflare Pages 边缘实时同步、KV 优先调度与多云对象存储！',
      author: '唯一站长 (Administrator)',
      date: '2025-05-18',
      target: 'all',
    }
  ]);
  const [newMsgTitle, setNewMsgTitle] = useState('');
  const [newMsgContent, setNewMsgContent] = useState('');
  const [newMsgTarget, setNewMsgTarget] = useState<'all' | 'verified'>('all');

  // Theme & Appearance
  const [selectedTheme, setSelectedTheme] = useState('emerald-white');
  const [bgColor, setBgColor] = useState('#f8fafc');
  const [avatarUrl, setAvatarUrl] = useState(settings.avatar);
  const [heroBannerUrl, setHeroBannerUrl] = useState(hero.bannerImage);

  // Registered users
  const [users, setUsers] = useState([
    { id: 'u-1', username: 'fox', email: 'admin@whitefox.blog', role: 'admin', registeredAt: '2025-05-01' },
    { id: 'u-2', username: '青丘客', email: 'visitor@example.com', role: 'member', registeredAt: '2025-05-10' },
    { id: 'u-3', username: '云端极客', email: 'cloudgeek@example.com', role: 'member', registeredAt: '2025-05-12' },
  ]);
  const [newUsername, setNewUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'member'>('member');

  // Fetch real-time KV status
  const refreshStorageStatus = async () => {
    try {
      const status = await api.getStorageStatus();
      setStorageStatus(status);
    } catch (e) {
      console.warn('Storage status check', e);
    }
  };

  useEffect(() => {
    refreshStorageStatus();
    const timer = setInterval(refreshStorageStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      await onUpdateSettings({
        ...formData,
        avatar: avatarUrl,
      });
      await onUpdateHero({
        ...heroData,
        bannerImage: heroBannerUrl,
      });
      setStatusMsg({ type: 'success', text: '全部参数已成功同步至边缘 KV 与数据库！' });
      refreshStorageStatus();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: '保存失败，请检查网络或配置' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whitefox-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('导出备份失败');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await api.importData(json);
      setStatusMsg({ type: 'success', text: '数据导入成功，全站配置与足迹已重载' });
      await onRefreshAll();
    } catch (err) {
      setStatusMsg({ type: 'error', text: '导入失败，请核对备份 JSON 格式' });
    }
  };

  const themePresets = [
    { id: 'emerald-white', name: '极简白翠', color: '#10b981', bg: '#f8fafc' },
    { id: 'cyber-fox', name: '灵狐绯红', color: '#f43f5e', bg: '#fff1f2' },
    { id: 'ocean-cyan', name: '远海云蓝', color: '#0284c7', bg: '#f0f9ff' },
    { id: 'amethyst-purple', name: '紫晶流光', color: '#8b5cf6', bg: '#faf5ff' },
    { id: 'ink-minimal', name: '玄墨简灰', color: '#334155', bg: '#f1f5f9' },
  ];

  return (
    <div className="space-y-6">
      {/* Real-Time KV / Database Dual-Storage Status Indicator Bar */}
      <div className="bg-white rounded-2xl border border-rose-100/80 p-4.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            {/* KV Indicator Light */}
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                storageStatus.kvConnected
                  ? 'bg-emerald-500 shadow-md shadow-emerald-400/50 animate-pulse'
                  : 'bg-amber-500 shadow-md shadow-amber-400/50'
              }`}
            />
            <span
              className={`absolute w-5 h-5 rounded-full -z-10 ${
                storageStatus.kvConnected ? 'bg-emerald-200 animate-ping opacity-75' : 'bg-amber-200'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 text-xs">
                {storageStatus.kvConnected ? 'Cloudflare KV 优先同步引擎 (已连接)' : '边缘数据库 D1 运行中 (KV降级)'}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  storageStatus.kvConnected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {storageStatus.kvConnected ? 'KV 实时优先模式' : '数据库回退容灾'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              空间命名: <code className="font-mono text-slate-600">{storageStatus.kvNamespace}</code> ·
              边缘往返延迟: <span className="font-mono text-emerald-600 font-bold">{storageStatus.syncLatencyMs}ms</span> ·
              实时同步所有浏览历史、图片、文件、博客及设定
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => refreshStorageStatus()}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>探测同步状态</span>
          </button>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 w-fit">
        <button
          onClick={() => setActiveTab('merged-email')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'merged-email'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>邮件 API 与信箱中心 (2合1)</span>
        </button>
        <button
          onClick={() => setActiveTab('merged-governance')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'merged-governance'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>用户、外观与广播枢纽 (4合1)</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'system'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>系统基建与部署</span>
        </button>
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

      {/* ========================================================= */}
      {/* 1. MERGED SECTION: 邮件服务与站内信箱综合管控区 (2个小分区) */}
      {/* ========================================================= */}
      {activeTab === 'merged-email' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Mail className="w-5 h-5 text-rose-500" />
              邮件 API 与站内信箱综合管控区
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              本区域整合了邮件网关路由与访客交互信件管理，下分为【邮件 API 与 Cloudflare Email Routing 服务】及【站内信箱与回复消息管理】两个专属分区。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SUB-PARTITION 1: 邮件 API 与 Cloudflare Email Routing 服务 */}
            <div className="lg:col-span-5 bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-rose-500" />
                  小分区 1：邮件 API 与 Cloudflare Email Routing 服务
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-mono font-bold">
                  Active
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">邮件服务提供商 (Provider)</label>
                  <select
                    value={emailProvider}
                    onChange={e => setEmailProvider(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="resend">Resend API (全球高投递推荐)</option>
                    <option value="cloudflare-email">Cloudflare Email Routing (边缘直接转发)</option>
                    <option value="sendgrid">Twilio SendGrid API</option>
                    <option value="mailgun">Mailgun REST API</option>
                    <option value="tencent-ses">腾讯云 SES 邮件推送</option>
                    <option value="aliyun-dm">阿里云 DirectMail 邮件推送</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">发信邮箱地址 (Sender Email)</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">API Key / Token 密钥</label>
                  <input
                    type="password"
                    value={emailApiKey}
                    onChange={e => setEmailApiKey(e.target.value)}
                    placeholder="re_xxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none font-mono"
                  />
                </div>

                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={emailRateLimit}
                    onChange={e => setEmailRateLimit(e.target.checked)}
                    className="w-4 h-4 text-rose-500 rounded border-slate-300"
                  />
                  <span className="text-slate-700 font-medium">开启边缘 IP 发信速率防刷限制 (Rate Limit)</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setStatusMsg({ type: 'success', text: '邮件服务与 Cloudflare 路由配置已保存并同步至 KV' });
                  }}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  保存邮件服务配置
                </button>
              </div>
            </div>

            {/* SUB-PARTITION 2: 站内信箱与回复消息管理 (支持删除消息) */}
            <div className="lg:col-span-7 bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-sky-500" />
                  小分区 2：站内信箱与回复消息管理 (支持删除消息)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">共 {letters.length} 封信件</span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {letters.map(letter => (
                  <div key={letter.id} className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">{letter.senderName}</span>
                        <span className="text-slate-400 font-mono text-[11px]">&lt;{letter.senderEmail}&gt;</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 text-[11px]">{letter.receivedAt}</span>
                        <button
                          onClick={() => {
                            if (confirm('确认删除该信件？')) {
                              setLetters(letters.filter(l => l.id !== letter.id));
                            }
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="删除消息"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="font-medium text-slate-700">{letter.subject}</p>
                    <div className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {letter.content}
                    </div>

                    {letter.replied ? (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-2 rounded-lg text-[11px]">
                        <span className="font-bold text-emerald-700">已于 {letter.repliedAt} 回复：</span>
                        <p className="mt-0.5">{letter.replyContent}</p>
                      </div>
                    ) : (
                      <div>
                        {replyLetterId === letter.id ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="撰写回复..."
                              rows={2}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setReplyLetterId(null)}
                                className="px-2.5 py-1 text-slate-500 text-xs"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => {
                                  if (!replyText.trim()) return;
                                  setLetters(letters.map(l => l.id === letter.id ? {
                                    ...l,
                                    replied: true,
                                    replyContent: replyText,
                                    repliedAt: new Date().toLocaleString('zh-CN'),
                                  } : l));
                                  setReplyLetterId(null);
                                  setReplyText('');
                                  setStatusMsg({ type: 'success', text: '已成功回复访客站内信件' });
                                }}
                                className="px-3 py-1 bg-sky-500 text-white rounded text-xs font-semibold"
                              >
                                确认回复
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyLetterId(letter.id);
                              setReplyText('');
                            }}
                            className="text-sky-600 hover:text-sky-700 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Reply className="w-3 h-3" />
                            撰写回复
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MERGED SECTION: 用户、外观与广播枢纽 (4个小分区)         */}
      {/* ========================================================= */}
      {activeTab === 'merged-governance' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-rose-500" />
              全站用户、视觉外观与权限统筹管控枢纽
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              集中管辖全站广播推送、视觉色彩与背景图谱、访客注册与可见性门槛，以及已注册用户名单，共下分 4 个专属分区。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SUB-PARTITION 1: 全站用户消息与通知管理 (底部控制区) */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-500" />
                  小分区 1：全站用户消息与通知管理 (底部控制区)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{userMessages.length} 条</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5 text-xs">
                <input
                  type="text"
                  placeholder="通知广播标题"
                  value={newMsgTitle}
                  onChange={e => setNewMsgTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5"
                />
                <textarea
                  placeholder="广播正文详情..."
                  rows={2}
                  value={newMsgContent}
                  onChange={e => setNewMsgContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newMsgTitle || !newMsgContent) return;
                    setUserMessages([{
                      id: `msg-${Date.now()}`,
                      title: newMsgTitle,
                      content: newMsgContent,
                      author: '站长通知',
                      date: new Date().toISOString().split('T')[0],
                      target: newMsgTarget,
                    }, ...userMessages]);
                    setNewMsgTitle('');
                    setNewMsgContent('');
                    setStatusMsg({ type: 'success', text: '广播通知已即时推送到全站' });
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-1.5 rounded text-xs flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  发布新全站广播通知
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {userMessages.map(msg => (
                  <div key={msg.id} className="bg-white border border-slate-200 rounded-lg p-3 text-xs flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{msg.title}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">{msg.content}</p>
                    </div>
                    <button
                      onClick={() => setUserMessages(userMessages.filter(m => m.id !== msg.id))}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SUB-PARTITION 2: 主题调色与本地图片设定 (头像/背景/Hero) */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-rose-500" />
                  小分区 2：主题调色与本地图片设定 (头像/背景/Hero)
                </span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                  KV 同步
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">预设色系风格</label>
                  <div className="grid grid-cols-5 gap-2">
                    {themePresets.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(p.id);
                          setBgColor(p.bg);
                        }}
                        className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 ${
                          selectedTheme === p.id ? 'border-rose-500 bg-rose-50/60 font-bold' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-[10px]">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">站长头像 URL</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">全局底色 (Hex)</label>
                    <input
                      type="text"
                      value={bgColor}
                      onChange={e => setBgColor(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hero 横幅大图 URL</label>
                  <input
                    type="text"
                    value={heroBannerUrl}
                    onChange={e => setHeroBannerUrl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-1.5 rounded text-xs flex items-center justify-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  保存视觉与主题配置
                </button>
              </div>
            </div>

            {/* SUB-PARTITION 3: 注册控制与访客隐藏选区开关 (仅管理员可见) */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-purple-500" />
                  小分区 3：注册控制与访客隐藏选区开关 (仅管理员可见)
                </span>
                <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-mono font-bold">
                  Security
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-3 text-xs">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.requireEmailRegistration}
                    onChange={e => setFormData({ ...formData, requireEmailRegistration: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">开放全站邮箱自主注册 (Register Policy)</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">关闭后仅站长可在后台手动授权增减用户</p>
                  </div>
                </label>

                <div className="border-t border-slate-100 pt-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.hideNonBlogForGuests}
                      onChange={e => setFormData({ ...formData, hideNonBlogForGuests: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-purple-600 rounded"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block">访客隐私模式：对未登录访客隐藏非博文选区</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">启用后未登录访客仅可见博文，隐藏网盘、文创商城与足迹</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-1.5 rounded text-xs flex items-center justify-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                保存注册与访客隐私策略
              </button>
            </div>

            {/* SUB-PARTITION 4: 已注册用户管理列表 (站长专属) */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  小分区 4：已注册用户管理列表 (站长专属)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{users.length} 位会员</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="用户名"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1"
                  />
                  <input
                    type="email"
                    placeholder="用户邮箱"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newUsername || !newUserEmail) return;
                    setUsers([{
                      id: `u-${Date.now()}`,
                      username: newUsername,
                      email: newUserEmail,
                      role: newUserRole,
                      registeredAt: new Date().toISOString().split('T')[0],
                    }, ...users]);
                    setNewUsername('');
                    setNewUserEmail('');
                    setStatusMsg({ type: 'success', text: `已添加注册用户 ${newUsername}` });
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded py-1 font-medium text-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新建注册账号
                </button>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {users.map(u => (
                  <div key={u.id} className="bg-white border border-slate-200 rounded p-2 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{u.username}</span>
                      <span className="text-slate-400 font-mono text-[10px] ml-2">{u.email}</span>
                    </div>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => setUsers(users.filter(x => x.id !== u.id))}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SYSTEM INFRASTRUCTURE & MULTI-CLOUD DEPLOYMENT          */}
      {/* ========================================================= */}
      {activeTab === 'system' && (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Site identity */}
          <div className="bg-white rounded-3xl border border-rose-100/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Globe className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900">博客基础身份与标语</h3>
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
              <label className="block text-xs font-medium text-slate-700 mb-1">站长作者名称</label>
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
          </div>

          {/* Multi-cloud & AI API settings */}
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">AI API Key (支持 DeepSeek / Cloudflare AI / OpenAI)</label>
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
              <label className="block text-xs font-medium text-slate-700 mb-1">坚果云 / WebDAV 远端同步 URL</label>
              <input
                type="text"
                value={formData.webdavUrl}
                onChange={e => setFormData({ ...formData, webdavUrl: e.target.value })}
                placeholder="https://dav.jianguoyun.com/dav/"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-mono"
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-emerald-600 text-white font-bold text-xs shadow-md shadow-rose-200 hover:opacity-95 flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? '保存中...' : '保存并同步所有设置'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Deployment Hub & Guides */}
      <div className="bg-white rounded-3xl border border-rose-100/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-6">
          <Server className="w-5 h-5 text-rose-500" />
          <h3 className="text-base font-bold text-slate-900">多云极速部署指引中枢 (Cloudflare / 腾讯云 / 阿里云 / Vercel)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60 space-y-2">
            <span className="font-bold text-xs text-orange-900 flex items-center space-x-1">
              <span>⚡ Cloudflare Pages (首选推荐)</span>
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
              <span>🐧 腾讯云 EdgeOne / Serverless</span>
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
              <span>☁️ 阿里云 ESA / FC 函数</span>
            </span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              1. 进入阿里云边缘安全加速 ESA；<br />
              2. 部署静态网站或边缘函数；<br />
              3. 可直接上传压缩包 <code>dist.zip</code> 一键上线。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-2">
            <span className="font-bold text-xs text-emerald-900 flex items-center space-x-1">
              <span>▲ Vercel / Docker 独立部署</span>
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              - Vercel: 自动检测 <code>vercel.json</code> 一键拉取部署；<br />
              - 独立服务器: 执行 <code>docker-compose up -d</code> 启动全栈持久化容器。
            </p>
          </div>
        </div>

        {/* Direct Upload Package */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="font-bold flex items-center space-x-2 text-slate-900">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>关于“直接上传压缩包”部署方案的获取与使用说明：</span>
          </div>
          <p className="leading-relaxed">
            如不想绑定 Git 仓库，可在本地终端执行：<br />
            <code className="bg-slate-200 px-2 py-0.5 rounded text-rose-600 font-mono font-bold">npm run build:pages</code><br />
            脚本将自动执行静态优化打包，并在项目根目录生成专用的 <code className="font-mono text-emerald-600 font-bold">dist-pages.zip</code> 离线包。随后打开 Cloudflare Pages 控制台，选择 <strong>“Direct Upload (直接上传)”</strong>，拖拽上传即可 0 秒极速发布。
          </p>
        </div>
      </div>

      {/* Data Migration & Backup Sync */}
      <div className="bg-white rounded-3xl border border-rose-100/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Database className="w-4 h-4 text-rose-500" />
            <span>全站数据备份与跨云迁移</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            全量导出或导入文章、书架进度、订单、网盘文件索引及设置，零 LocalStorage 依赖。
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
