import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { api } from '../api';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AIView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `### 狐仙极客 AI 编程助手已就绪 🦊
我是 fox 博客内置的高级智能编程与云架构专家，原生支持生成生产级 TypeScript/React 代码、Serverless Workers 边缘函数及 D1/R2 多云架构设计。

**核心亮点：**
1. **真实代码生成**：支持完整可用代码段输出与一键代码复制；
2. **多云边缘架构**：Cloudflare Workers, D1 数据库, KV 优先引擎与 R2 实战方案；
3. **零 LocalStorage**：纯净 RESTful 原子同步。

请在下方直接输入您的技术需求或点击快捷指令！`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [currentModel, setCurrentModel] = useState('DeepSeek Coder V2 (推荐)');

  const quickPrompts = [
    '用TypeScript写一个带自动重试的fetch客户端',
    '如何用 Cloudflare Workers KV 实现防刷限流器？',
    '编写一个用于 React 18 的无 LocalStorage 状态同步 Hook',
    '写一份 Node.js + Express 生产级轻量文件存储 API'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatAi({
        messages: newMessages,
        model: currentModel
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

  return (
    <div className="space-y-4">
      {/* Top Banner Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-emerald-900/10 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <span>编程 AI · 智能工作台</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              真实模型可用 · 即时生成
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            接入 DeepSeek-Coder 与 Cloudflare Workers AI，实时编写与审查生产级代码
          </p>
        </div>

        {/* Model Selector */}
        <div className="flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-emerald-600" />
          <select
            value={currentModel}
            onChange={e => setCurrentModel(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 outline-none focus:border-emerald-500 font-medium"
          >
            <option value="DeepSeek Coder V2 (推荐)">DeepSeek Coder V2 (推荐)(全栈编程)</option>
            <option value="Qwen 2.5 Coder 72B">Qwen 2.5 Coder 72B (超强逻辑)</option>
            <option value="DeepSeek-R1 (深度思考)">DeepSeek-R1 (深度思考链)</option>
            <option value="GPT-4o Mini">GPT-4o Mini (极速响应)</option>
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="bg-white rounded-xl border border-emerald-900/10 shadow-xs p-4 sm:p-6 min-h-[460px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isUser ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white shadow-2xs'
              }`}>
                {isUser ? '👤' : '🦊'}
              </div>

              {/* Message Bubble */}
              <div className={`relative max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                isUser
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'bg-[#f8faf9] text-slate-800 border border-emerald-100 shadow-2xs'
              }`}>
                {/* One click copy code button for assistant messages */}
                {!isUser && (
                  <button
                    onClick={() => handleCopyCode(m.content, idx)}
                    title="复制回答或代码"
                    className="absolute top-3 right-3 p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-500 transition"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}

                <div className="whitespace-pre-wrap font-sans">
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 p-2">
            <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>AI 架构师正在深度思考并编写代码...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Command Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 text-xs">
        <span className="text-slate-400 whitespace-nowrap flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-emerald-600" />
          快速代码指令:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-slate-600 rounded-full whitespace-nowrap shadow-2xs transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-emerald-900/10 shadow-xs">
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
          disabled={loading || !input.trim()}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-xs transition disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>发送</span>
        </button>
      </div>
    </div>
  );
};
