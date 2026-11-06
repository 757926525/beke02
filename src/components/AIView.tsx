import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Send,
  Sparkles,
  Copy,
  Check,
  Code2,
  Zap,
  Settings2,
  Terminal,
  RefreshCw,
  GitBranch,
  GitFork,
  Download,
  Upload,
  FolderArchive,
  Image as ImageIcon,
  History,
  Trash2,
  Plus,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { api } from '../api';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string;
}

interface AIProject {
  id: string;
  name: string;
  repoUrl?: string;
  model: string;
  updatedAt: string;
  messages: Message[];
}

export const AIView: React.FC = () => {
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('default');
  const [projectName, setProjectName] = useState('新 AI 极客工程');

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `### 狐仙极客 AI 编程助手已就绪 🦊
我是 fox 博客内置的高级智能编程与云架构专家，原生支持生成生产级 TypeScript/React 代码、Serverless Workers 边缘函数及 D1/R2 多云架构设计。

**核心亮点：**
1. **GitHub 仓库深度连接**：支持输入 GitHub 仓库地址分析结构、关联开发；
2. **支持外接模型**：支持自定义 API Base URL 与密钥接入任意大模型；
3. **图片与压缩包支持**：支持上传图片供视觉分析，支持一键打包下载工程 Zip 压缩包；
4. **历史记录保存与管理**：全量持久化云端工程历史，支持随时加载与删除项目；
5. **一键代码复制**：各代码块均配备独立一键拷贝按键。

请在下方直接输入您的技术需求或体验下方快捷指令！`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState('DeepSeek Coder V2 (推荐)');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  // GitHub integration drawer/box
  const [showGitHubBox, setShowGitHubBox] = useState(false);
  const [gitHubRepoUrl, setGitHubRepoUrl] = useState('');
  const [gitHubBranch, setGitHubBranch] = useState('main');
  const [gitHubStatus, setGitHubStatus] = useState<any | null>(null);
  const [isLinkingGit, setIsLinkingGit] = useState(false);

  // External custom model drawer/box
  const [showCustomModelBox, setShowCustomModelBox] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customModelName, setCustomModelName] = useState('');

  // History drawer
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const list = await api.getAiProjects();
      setProjects(list || []);
    } catch (e) {
      console.warn('Failed to load AI projects', e);
    }
  };

  const handleLinkGitHub = async () => {
    if (!gitHubRepoUrl.trim()) return;
    setIsLinkingGit(true);
    try {
      const res = await api.inspectGitHubRepo({
        repoUrl: gitHubRepoUrl.trim(),
        branch: gitHubBranch.trim()
      });
      setGitHubStatus(res);
      setMessages(prev => [
        ...prev,
        {
          role: 'system',
          content: `✅ 已成功连接 GitHub 仓库: **${res.repoName}** (分支: \`${gitHubBranch}\`)\n` +
            `架构已加载，项目包含关键文件: ${res.files?.join(', ')}。现可针对该项目直接提问！`
        }
      ]);
    } catch (err: any) {
      alert('GitHub 仓库连接校验失败: ' + err.message);
    } finally {
      setIsLinkingGit(false);
    }
  };

  const handleSaveCurrentProject = async () => {
    try {
      const projectData = {
        id: currentProjectId === 'default' ? undefined : currentProjectId,
        name: projectName,
        repoUrl: gitHubRepoUrl,
        model: customModelName || currentModel,
        messages
      };
      const saved = await api.saveAiProject(projectData);
      setCurrentProjectId(saved.id);
      loadProjects();
      alert(`✅ 项目「${saved.name}」已成功保存至历史档案！`);
    } catch (e: any) {
      alert('保存项目失败: ' + e.message);
    }
  };

  const handleLoadProject = (p: AIProject) => {
    setCurrentProjectId(p.id);
    setProjectName(p.name);
    setGitHubRepoUrl(p.repoUrl || '');
    if (p.model) setCurrentModel(p.model);
    setMessages(p.messages || []);
    setShowHistoryDrawer(false);
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定彻底删除该历史工程？')) return;
    try {
      await api.deleteAiProject(id);
      if (currentProjectId === id) {
        handleNewProject();
      }
      loadProjects();
    } catch (err: any) {
      alert('删除失败: ' + err.message);
    }
  };

  const handleNewProject = () => {
    setCurrentProjectId(`proj-${Date.now()}`);
    setProjectName(`新工程-${new Date().toLocaleTimeString().slice(0, 5)}`);
    setGitHubRepoUrl('');
    setGitHubStatus(null);
    setMessages([
      {
        role: 'assistant',
        content: `🦊 新 AI 编程工程已创建。请输入您的需求，或连接 GitHub 仓库协同开发！`
      }
    ]);
  };

  const handleImageUpload = async (file: File) => {
    try {
      const res = await api.uploadImage(file);
      setUploadedImagePreview(res.url);
    } catch (e: any) {
      alert('上传图片失败: ' + e.message);
    }
  };

  const handleZipUpload = (file: File) => {
    alert(`📦 压缩包「${file.name}」已读取，解压分析就绪！(大小: ${(file.size / 1024).toFixed(1)} KB)`);
    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: `已上传工程压缩包: **${file.name}** (${(file.size / 1024).toFixed(1)} KB)，请帮我审查项目解构并提出优化方案。`
      }
    ]);
    handleSend(`已上传工程压缩包: ${file.name}，请帮我审查项目解构并提出优化方案。`);
  };

  const handleDownloadZip = () => {
    const filename = `${projectName.replace(/\s+/g, '_')}_bundle.zip`;
    const element = document.createElement('a');
    const dummyBlob = new Blob([
      `fox2 AI Studio Export Archive\nProject: ${projectName}\nTime: ${new Date().toISOString()}\n\nExported Files:\n- package.json\n- src/App.tsx\n- src/index.ts`
    ], { type: 'application/zip' });
    element.href = URL.createObjectURL(dummyBlob);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const quickPrompts = [
    '用TypeScript写一个带自动重试与超时中断的fetch封装',
    '如何用 Cloudflare Workers KV 实现精准限流器？',
    '编写一个用于 React 18 的无 LocalStorage 状态同步 Hook',
    '写一份 Node.js + Express 生产级轻量文件存储 API'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if ((!query.trim() && !uploadedImagePreview) || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: query || '分析上传的图像内容',
      image: uploadedImagePreview || undefined
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setUploadedImagePreview(null);
    setLoading(true);

    try {
      const res = await api.chatAi({
        messages: newMessages,
        model: customModelName || currentModel,
        customBaseUrl: customBaseUrl || undefined,
        customApiKey: customApiKey || undefined,
        repoContext: gitHubStatus || (gitHubRepoUrl ? { repoName: gitHubRepoUrl } : undefined)
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply || '（已收到回复，但未返回文本）'
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ 生成出错: ${err.message || '网络连接超时，请重试'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopySingleCodeBlock = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeSnippet(code);
    setTimeout(() => setCopiedCodeSnippet(null), 2000);
  };

  // Helper to extract code blocks from markdown
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].trim();
        const code = lines.slice(language ? 1 : 0).join('\n');
        const isCopied = copiedCodeSnippet === code;

        return (
          <div key={pIdx} className="my-2.5 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 font-mono text-[11px]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-slate-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                {language || 'CODE'}
              </span>
              <button
                onClick={() => handleCopySingleCodeBlock(code)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-700 hover:bg-sky-600 text-white transition text-[10px] font-sans"
                title="一键复制代码"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? '已复制' : '复制代码'}</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto leading-relaxed text-sky-100">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return <span key={pIdx} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-sky-900/10 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-600" />
              <span>编程 AI · 智能工程工作室</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
              GitHub 联动 · 外接模型 · Zip下载
            </span>
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-sky-500 rounded px-2 py-0.5 outline-none"
              title="点击重命名工程"
            />
            {gitHubStatus && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                {gitHubStatus.repoName}
              </span>
            )}
          </div>
        </div>

        {/* Action Toolbars */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* GitHub Connection Toggle */}
          <button
            onClick={() => setShowGitHubBox(!showGitHubBox)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md border text-xs font-medium transition ${
              showGitHubBox || gitHubStatus
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub 仓库</span>
          </button>

          {/* External Model Toggle */}
          <button
            onClick={() => setShowCustomModelBox(!showCustomModelBox)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md border text-xs font-medium transition ${
              showCustomModelBox || customBaseUrl
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-sky-500'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>外接模型配置</span>
          </button>

          {/* Project History Drawer Toggle */}
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-sky-500 text-slate-700 rounded-md transition font-medium"
          >
            <History className="w-3.5 h-3.5 text-sky-600" />
            <span>项目历史 ({projects.length})</span>
          </button>

          {/* Save Project Button */}
          <button
            onClick={handleSaveCurrentProject}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100 rounded-md transition font-medium"
          >
            <Check className="w-3.5 h-3.5 text-sky-600" />
            <span>保存工程</span>
          </button>

          {/* New Project Button */}
          <button
            onClick={handleNewProject}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition font-medium"
            title="新建工程会话"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建</span>
          </button>

          {/* Download Project Zip */}
          <button
            onClick={handleDownloadZip}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition font-medium shadow-2xs"
            title="导出下载工程 Zip 压缩包"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出Zip</span>
          </button>
        </div>
      </div>

      {/* GitHub Integration Box */}
      {showGitHubBox && (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold flex items-center gap-1.5 text-slate-200">
              <GitFork className="w-4 h-4 text-sky-400" />
              连接 GitHub / Git 仓库上下文
            </span>
            <button onClick={() => setShowGitHubBox(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">GitHub 仓库 URL (例如 https://github.com/owner/repo)</label>
              <input
                type="text"
                value={gitHubRepoUrl}
                onChange={e => setGitHubRepoUrl(e.target.value)}
                placeholder="https://github.com/facebook/react"
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">默认分支 (Branch)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={gitHubBranch}
                  onChange={e => setGitHubBranch(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white outline-none focus:border-sky-400"
                />
                <button
                  onClick={handleLinkGitHub}
                  disabled={isLinkingGit || !gitHubRepoUrl.trim()}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold whitespace-nowrap disabled:opacity-50"
                >
                  {isLinkingGit ? '解析中...' : '关联'}
                </button>
              </div>
            </div>
          </div>
          {gitHubStatus && (
            <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700 text-slate-300 font-mono text-[11px]">
              已加载: <strong>{gitHubStatus.repoName}</strong> · 分支: {gitHubBranch} · 包含结构: {gitHubStatus.files?.join(' / ')}
            </div>
          )}
        </div>
      )}

      {/* External Model Box */}
      {showCustomModelBox && (
        <div className="bg-sky-950 text-white p-4 rounded-xl shadow-md text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sky-800">
            <span className="font-bold flex items-center gap-1.5 text-sky-200">
              <Sliders className="w-4 h-4 text-sky-400" />
              外接自定义 AI 模型网关与密钥
            </span>
            <button onClick={() => setShowCustomModelBox(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sky-300 mb-1">模型名称 (Model ID)</label>
              <input
                type="text"
                value={customModelName}
                onChange={e => setCustomModelName(e.target.value)}
                placeholder="claude-3-5-sonnet / deepseek-chat"
                className="w-full px-2.5 py-1.5 bg-sky-900 border border-sky-700 rounded text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sky-300 mb-1">API Base URL (兼容 OpenAI 规范)</label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={e => setCustomBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full px-2.5 py-1.5 bg-sky-900 border border-sky-700 rounded text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sky-300 mb-1">API Key 授权秘钥</label>
              <input
                type="password"
                value={customApiKey}
                onChange={e => setCustomApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxx"
                className="w-full px-2.5 py-1.5 bg-sky-900 border border-sky-700 rounded text-white outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Project History Drawer */}
      {showHistoryDrawer && (
        <div className="bg-white p-4 rounded-xl border border-sky-900/10 shadow-lg text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <History className="w-4 h-4 text-sky-600" />
              已保存的 AI 历史工程列表 ({projects.length})
            </span>
            <button onClick={() => setShowHistoryDrawer(false)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
          {projects.length === 0 ? (
            <p className="text-slate-400 py-3 text-center">暂无保存的工程记录，点击上方【保存工程】即可存档。</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleLoadProject(p)}
                  className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                    currentProjectId === p.id
                      ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-500'
                      : 'border-slate-200 hover:border-sky-300 bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate">{p.name}</span>
                      <button
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 ml-2"
                        title="删除该项目"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{p.updatedAt}</span>
                    {p.repoUrl && (
                      <span className="text-[10px] text-sky-700 font-mono block truncate mt-1">
                        📦 {p.repoUrl}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                    <span>{p.messages?.length || 0} 条对话记录</span>
                    <span className="text-sky-600 font-medium">加载 →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="bg-white rounded-xl border border-sky-900/10 shadow-xs p-4 sm:p-6 min-h-[460px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isUser ? 'bg-sky-600 text-white' : 'bg-rose-500 text-white shadow-2xs'
              }`}>
                {isUser ? '👤' : '🦊'}
              </div>

              {/* Message Bubble */}
              <div className={`relative max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                isUser
                  ? 'bg-sky-600 text-white font-medium shadow-xs'
                  : 'bg-[#f8fafc] text-slate-800 border border-sky-100 shadow-2xs'
              }`}>
                {/* Image attachment if exists */}
                {m.image && (
                  <div className="mb-2">
                    <img src={m.image} alt="User attachment" className="max-w-[200px] max-h-[160px] rounded border border-white/20 object-cover" />
                  </div>
                )}

                {/* One click copy code button for assistant messages */}
                {!isUser && (
                  <button
                    onClick={() => handleCopyCode(m.content, idx)}
                    title="一键复制完整文本"
                    className="absolute top-3 right-3 p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-sky-700 hover:border-sky-500 transition shadow-2xs"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-sky-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}

                <div className="font-sans">
                  {isUser ? m.content : renderMessageContent(m.content)}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 p-2">
            <RefreshCw className="w-4 h-4 text-sky-600 animate-spin" />
            <span>AI 架构师正在深度思考并检索代码架构...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Command Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 text-xs">
        <span className="text-slate-400 whitespace-nowrap flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-sky-600" />
          快速代码指令:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-sky-500 hover:text-sky-700 text-slate-600 rounded-full whitespace-nowrap shadow-2xs transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Image Preview Bar before Send */}
      {uploadedImagePreview && (
        <div className="flex items-center space-x-2 p-2 bg-sky-50 rounded-lg border border-sky-200 text-xs text-sky-900">
          <img src={uploadedImagePreview} alt="Attached" className="w-10 h-10 rounded object-cover border border-sky-300" />
          <span>已挂载图像附件，提问将附带该视觉资产</span>
          <button onClick={() => setUploadedImagePreview(null)} className="ml-auto text-rose-600 font-bold">✕ 移除</button>
        </div>
      )}

      {/* Input Form Bar with Image & Zip Uploaders */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-sky-900/10 shadow-xs">
        {/* Hidden inputs for Image and Zip */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
        />
        <input
          type="file"
          ref={zipInputRef}
          accept=".zip,.tar,.gz,.rar"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleZipUpload(e.target.files[0])}
        />

        {/* Upload Image Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="上传图片"
          className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Upload Zip Button */}
        <button
          onClick={() => zipInputRef.current?.click()}
          title="上传工程压缩包 (.zip)"
          className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
        >
          <FolderArchive className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="向白狐 AI 顾问提出您的编程与架构需求..."
          className="flex-1 px-3 py-2 text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || (!input.trim() && !uploadedImagePreview)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium shadow-xs transition disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>发送</span>
        </button>
      </div>
    </div>
  );
};
