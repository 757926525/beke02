import React, { useState } from 'react';
import { CloudFile } from '../types';
import {
  Upload,
  Trash2,
  Download,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Search,
  HardDrive,
  LayoutGrid,
  List,
  Columns,
  Grid3X3,
  CheckSquare,
  Square,
  HelpCircle
} from 'lucide-react';

interface CloudDriveViewProps {
  files: CloudFile[];
  storageUsed: number;
  storageTotal: number;
  isAdmin?: boolean;
  onUploadFile: (file: File) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
  onBatchDelete?: (ids: string[]) => Promise<void>;
}

export const CloudDriveView: React.FC<CloudDriveViewProps> = ({
  files,
  storageUsed,
  storageTotal,
  isAdmin,
  onUploadFile,
  onDeleteFile,
  onBatchDelete,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'medium' | 'small' | 'large' | 'detail'>('detail');

  // Upload & Download Progress Simulation State
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ id: string; progress: number } | null>(null);
  const [showMultiCloudGuide, setShowMultiCloudGuide] = useState(false);

  // If not admin, hide drive (restricted)
  if (!isAdmin) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
        <HardDrive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">网盘与 WebDAV 区域仅站长（管理员）可见</h3>
        <p className="text-xs text-slate-400 mt-1">访客与普通注册用户仅能浏览前台开放资源。</p>
      </div>
    );
  }

  const handleUploadWithProgress = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Simulate progressive visual tracker
      setUploadProgress(10);
      const timer = setInterval(() => {
        setUploadProgress(prev => (prev !== null && prev < 90 ? prev + 20 : prev));
      }, 100);

      try {
        await onUploadFile(file);
        setUploadProgress(100);
      } catch (err: any) {
        alert(`上传失败: ${file.name} - ${err.message}`);
      } finally {
        clearInterval(timer);
        setTimeout(() => setUploadProgress(null), 600);
      }
    }
  };

  const handleDownloadWithProgress = async (file: CloudFile) => {
    setDownloadProgress({ id: file.id, progress: 20 });
    const timer = setInterval(() => {
      setDownloadProgress(prev => {
        if (!prev) return null;
        if (prev.progress >= 90) {
          clearInterval(timer);
          return { id: file.id, progress: 95 };
        }
        return { id: file.id, progress: prev.progress + 25 };
      });
    }, 100);

    try {
      // Robust download via fetch blob + <a> click (bypasses browser location.href blocking & reverse proxy limitations)
      const res = await fetch(`/api/files/download/${file.id}`);
      if (!res.ok) {
        throw new Error(`下载服务响应失败 (HTTP ${res.status})`);
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      setDownloadProgress({ id: file.id, progress: 100 });
    } catch (err: any) {
      // Fallback: direct window download
      window.open(`/api/files/download/${file.id}`, '_blank');
    } finally {
      clearInterval(timer);
      setTimeout(() => setDownloadProgress(null), 600);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map(f => f.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBatchDeleteClick = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定要批量删除选中的 ${selectedIds.length} 个文件吗？`)) return;
    if (onBatchDelete) {
      await onBatchDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-sky-600" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-indigo-500" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-rose-500" />;
    if (type.includes('zip') || type.includes('tar') || type.includes('rar')) return <Archive className="w-5 h-5 text-amber-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Ribbon */}
      <div className="bg-white p-5 rounded-xl border border-sky-900/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-sky-600" />
              <span>多云网盘中枢 (站长专属权限)</span>
            </h2>
            <button
              onClick={() => setShowMultiCloudGuide(!showMultiCloudGuide)}
              className="text-xs text-sky-700 hover:text-sky-800 flex items-center gap-0.5 underline font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>多云调度使用指南</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            支持单个与批量文件极速上传下载、流式传输、多模式视图切换与 WebDAV 双向同步。
          </p>
        </div>

        {/* Upload Button */}
        <div className="flex items-center space-x-2">
          {selectedIds.length > 0 && onBatchDelete && (
            <button
              onClick={handleBatchDeleteClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批量删除 ({selectedIds.length})</span>
            </button>
          )}

          <label className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-sky-600 text-white text-xs font-medium hover:bg-sky-700 cursor-pointer shadow-xs transition">
            <Upload className="w-3.5 h-3.5" />
            <span>单个/批量上传文件</span>
            <input
              type="file"
              multiple
              onChange={handleUploadWithProgress}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Multi-cloud Dispatcher Guide Drawer */}
      {showMultiCloudGuide && (
        <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-slate-700 space-y-3">
          <div className="font-bold text-sky-900 text-sm">
            🌐 fox2 多云调度中枢使用详细指南
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-lg border border-sky-100">
              <div className="font-bold text-sky-800">1. 本地存储模式 (零网络依赖)</div>
              <div className="text-slate-600 text-[11px] mt-1">
                当未配置 Cloudflare 或公有云凭证时，系统自动使用服务器本地磁盘 uploads 目录保存资产，数据写入本地 JSON 数据库，离线可用。
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-sky-100">
              <div className="font-bold text-sky-800">2. Cloudflare R2 对象存储</div>
              <div className="text-slate-600 text-[11px] mt-1">
                在 Cloudflare Pages 后台绑定 R2 存储桶变量名，即可享受全球 CDN 免出站流量费高速下发，数值真实显示。
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-sky-100">
              <div className="font-bold text-sky-800">3. 坚果云 / WebDAV 远端同步</div>
              <div className="text-slate-600 text-[11px] mt-1">
                在【系统管理设置】中填入服务器地址、用户名、密码和路径四大接口，一键测试连通并进行双向冷备。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bars (Upload / Download) */}
      {uploadProgress !== null && (
        <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
          <div className="flex items-center justify-between text-xs font-semibold text-sky-900 mb-1">
            <span>正在上传文件至多云网盘...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-600 h-2 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {downloadProgress !== null && (
        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 mb-1">
            <span>正在准备并下载文件副本...</span>
            <span>{downloadProgress.progress}%</span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 transition-all duration-200"
              style={{ width: `${downloadProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter, Search & 4 View Mode Switchers */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-sky-900/10 shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            {selectedIds.length === filteredFiles.length && filteredFiles.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>全选 / 反选</span>
          </button>
          <span className="text-xs text-slate-400">
            共 {filteredFiles.length} 个文件
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索文件名..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-sky-500 focus:bg-white transition"
            />
          </div>

          {/* 4 View Modes */}
          <div className="flex items-center border border-slate-200 rounded-md p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('small')}
              title="小图视图"
              className={`p-1 rounded ${viewMode === 'small' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('medium')}
              title="中图视图"
              className={`p-1 rounded ${viewMode === 'medium' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('large')}
              title="大图卡片视图"
              className={`p-1 rounded ${viewMode === 'large' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('detail')}
              title="详细信息列表"
              className={`p-1 rounded ${viewMode === 'detail' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-sky-300">
          <HardDrive className="w-8 h-8 text-sky-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">网盘暂无文件，点击上方按钮上传</p>
        </div>
      ) : viewMode === 'detail' ? (
        /* Detailed List View */
        <div className="bg-white rounded-xl border border-sky-900/10 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8faf9] text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">文件名</th>
                <th className="py-2.5 px-3 w-28">大小</th>
                <th className="py-2.5 px-3 w-36">更新时间</th>
                <th className="py-2.5 px-3 w-24 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFiles.map(file => {
                const isSelected = selectedIds.includes(file.id);
                return (
                  <tr key={file.id} className={`hover:bg-sky-50/50 transition ${isSelected ? 'bg-sky-50/60' : ''}`}>
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(file.id)}
                        className="rounded border-slate-300 text-sky-600"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file.type)}
                        <span className="font-medium text-slate-800 truncate max-w-md">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{file.updatedAt}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleDownloadWithProgress(file)}
                          title="下载文件"
                          className="p-1 text-slate-400 hover:text-sky-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`确认删除 ${file.name}？`)) onDeleteFile(file.id);
                          }}
                          title="删除文件"
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Small, Medium, Large Grid Views */
        <div className={
          viewMode === 'small'
            ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3'
            : (viewMode === 'large'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4')
        }>
          {filteredFiles.map(file => {
            const isSelected = selectedIds.includes(file.id);
            return (
              <div
                key={file.id}
                onClick={() => handleToggleSelect(file.id)}
                className={`bg-white rounded-lg border p-3 flex flex-col justify-between cursor-pointer transition shadow-2xs hover:shadow-sm ${
                  isSelected ? 'border-sky-600 bg-sky-50/30 ring-1 ring-sky-500' : 'border-sky-900/10 hover:border-sky-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={e => {
                      e.stopPropagation();
                      handleToggleSelect(file.id);
                    }}
                    className="rounded text-sky-600"
                  />
                  <span className="text-[10px] text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>

                <div className="flex flex-col items-center py-2 text-center">
                  <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 mb-1.5">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate w-full" title={file.name}>
                    {file.name}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="truncate">{file.updatedAt.split(' ')[0]}</span>
                  <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleDownloadWithProgress(file)}
                      className="p-1 hover:text-sky-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确认删除 ${file.name}？`)) onDeleteFile(file.id);
                      }}
                      className="p-1 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
