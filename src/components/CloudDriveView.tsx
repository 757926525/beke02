import React, { useRef, useState } from 'react';
import { CloudFile } from '../types';
import {
  HardDrive,
  UploadCloud,
  Download,
  Trash2,
  FileText,
  FileVideo,
  FileArchive,
  File,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface CloudDriveViewProps {
  files: CloudFile[];
  storageUsed: number;
  storageTotal: number;
  onUploadFile: (file: File) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
}

export const CloudDriveView: React.FC<CloudDriveViewProps> = ({
  files,
  storageUsed,
  storageTotal,
  onUploadFile,
  onDeleteFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.includes('video') || name.endsWith('.mp4') || name.endsWith('.webm')) {
      return <FileVideo className="w-5 h-5 text-indigo-500" />;
    }
    if (type.includes('zip') || name.endsWith('.zip') || name.endsWith('.tar.gz')) {
      return <FileArchive className="w-5 h-5 text-amber-500" />;
    }
    if (type.includes('pdf') || name.endsWith('.pdf') || name.endsWith('.md')) {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setUploading(true);
    setStatusMsg(null);
    try {
      await onUploadFile(selected);
      setStatusMsg({ type: 'success', text: `文件【${selected.name}】成功上传并同步至云存储！` });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: '文件上传失败，请检查网络或后端状态。' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: CloudFile) => {
    if (!confirm(`确定要彻底删除文件【${file.name}】吗？`)) return;
    try {
      await onDeleteFile(file.id);
      setStatusMsg({ type: 'success', text: `文件【${file.name}】已成功移除。` });
    } catch (err) {
      setStatusMsg({ type: 'error', text: '删除失败，请稍后再试。' });
    }
  };

  const percentage = Math.min(100, Math.round((storageUsed / storageTotal) * 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">网盘与 WebDAV · 云端文件管家</h2>
          <p className="text-xs text-slate-500 mt-0.5">多云原生对象存储 · 支持直接下载、上传与 WebDAV 挂载</p>
        </div>

        {/* Hidden input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{uploading ? '上传中...' : '上传新文件至云端'}</span>
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

      {/* Storage Indicator */}
      <div className="bg-white rounded-2xl border border-rose-100/80 p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="flex items-center space-x-2 text-slate-800">
            <HardDrive className="w-4 h-4 text-rose-500" />
            <span>存储空间使用配额 (R2 / OSS / COS)</span>
          </span>
          <span className="text-slate-500 font-mono">
            {storageUsed} MB / {(storageTotal / 1024).toFixed(1)} GB ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(percentage, 1)}%` }}
          />
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-2xl border border-rose-100/80 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">文件列表 ({files.length})</h3>
          <span className="text-[11px] text-slate-400">已开启直接下载与服务端状态记忆</span>
        </div>

        {files.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            网盘暂无文件，点击右上角“上传新文件至云端”开始使用
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {files.map(file => (
              <div
                key={file.id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0 pr-4">
                  <div className="p-2.5 rounded-xl bg-slate-100 shrink-0">
                    {getFileIcon(file.type, file.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>{formatSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.updatedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={`/api/files/download/${file.id}`}
                    download={file.name}
                    className="p-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center space-x-1 text-xs font-medium"
                    title="下载文件"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">下载</span>
                  </a>

                  <button
                    onClick={() => handleDelete(file)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
