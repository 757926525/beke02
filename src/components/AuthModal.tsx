import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound, User, Mail, ShieldAlert } from 'lucide-react';
import { api, setAuthSession } from '../api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(username, password);
        setAuthSession(res.user.role, res.user.id, res.user.username);
        onLoginSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(username, email);
        setAuthSession(res.user.role, res.user.id, res.user.username);
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请核对信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-emerald-900/10 max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center font-bold">
            🦊
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'login' ? '用户与管理员登录' : '注册新用户'}
            </h2>
            <p className="text-xs text-slate-500">
              唯一管理员具备全站系统控制权；注册用户支持发帖与自删。
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              用户名
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="例如: admin 或 您的昵称"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                电子邮箱 (选填)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              密码 {mode === 'register' && <span className="font-normal text-slate-400">(新用户可免密或任意设置)</span>}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required={mode === 'login'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'login' ? '站长初始密码: fox2admin888' : '设置个人密码'}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-sm shadow-xs transition disabled:opacity-50"
          >
            {loading ? '处理中...' : (mode === 'login' ? '登 录' : '立即注册')}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>{mode === 'login' ? '还没有账号？' : '已有账号？'}</span>
          <button
            onClick={() => {
              setError(null);
              setMode(mode === 'login' ? 'register' : 'login');
            }}
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
          >
            {mode === 'login' ? '注册新用户' : '返回登录'}
          </button>
        </div>
      </div>
    </div>
  );
};
