import React, { useState } from 'react';
import {
  Cpu,
  Send,
  Bot,
  User,
  Sparkles,
  Terminal,
  Code2,
  Zap,
  Play,
  Copy,
  Check,
  Layers,
  Wand2
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
我是白狐博客内置的高级智能编程与云架构专家，支持实时生成、审查与模拟执行代码。

**功能亮点：**
1. **多云与边缘架构实战**：Cloudflare Pages / Workers、D1 数据库与 KV 优先引擎实战代码。
2. **React 18 / TypeScript 编写**：零本地存储依赖设计、RESTful API、高并发性能优化。
3. **真实代码生成与即时测试**：支持生成完整可用代码段，并提供一键复制代码。

请在下方输入您的编程需求或点击快捷指令！`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('deepseek-coder-v2');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const models = [
    { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2 (推荐)', badge: '全栈编程' },
    { id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', name: 'DeepSeek-R1 (Qwen-32B)', badge: '深度推理' },
    { id: 'qwen-2.5-coder-72b', name: 'Qwen 2.5 Coder 72B', badge: '精准算法' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', badge: '敏捷轻量' },
  ];

  const quickPrompts = [
    '用 TypeScript 写一个带自动重试的 fetch 客户端',
    '如何用 Cloudflare Workers KV 实现防刷限流器？',
    '编写一个用于 React 18 的无 LocalStorage 状态同步 Hook',
    '写一份 Node.js + Express 生产级轻量高并发 Dockerfile',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendAIChat(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        model
      );
      if (res && res.reply) {
        setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: '抱歉，未能获得模型响应，请核对网络与设置。' }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: '网络请求异常，请检查服务端连接。' }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">编程 AI · 智能工作台</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              真实模型可用 · 即时生成
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">接入 DeepSeek-Coder 与 Cloudflare Workers AI，实时编写与审查生产级代码</p>
        </div>

        {/* Model Selector */}
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-rose-100 shadow-xs">
          <Cpu className="w-4 h-4 text-rose-500 ml-1" />
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none pr-2 cursor-pointer"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.badge})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-rose-100/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    isUser
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                    isUser
                      ? 'bg-rose-500 text-white rounded-tr-none font-medium'
                      : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100 whitespace-pre-wrap'
                  }`}
                >
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.content, index)}
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-slate-600 px-2 py-1 rounded text-[11px] border border-slate-200 flex items-center gap-1 transition-opacity shadow-xs"
                      title="复制全文"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>复制</span>
                        </>
                      )}
                    </button>
                  )}
                  {msg.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-3 text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="animate-pulse">DeepSeek Coder 正在深度推导代码逻辑...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Code2 className="w-3 h-3 text-rose-500" />
            快速代码指令:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 text-xs whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="向白狐 AI 顾问提出您的编程与架构需求..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">发送</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
