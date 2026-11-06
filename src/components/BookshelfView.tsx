import React, { useState } from 'react';
import { Book } from '../types';
import {
  BookOpen,
  ChevronRight,
  CheckCircle,
  Upload,
  Download,
  FileText,
  Smartphone,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import { api } from '../api';

interface BookshelfViewProps {
  books: Book[];
  isAdmin?: boolean;
  onUpdateProgress: (bookId: string, page: number) => void;
  onRefresh?: () => void;
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  books,
  isAdmin,
  onUpdateProgress,
  onRefresh,
}) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [uploadingBook, setUploadingBook] = useState(false);
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  // E-book upload handler
  const handleUploadEBook = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect format
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedFormats = ['epub', 'pdf', 'txt', 'mobi', 'azw3'];

    if (!allowedFormats.includes(ext || '')) {
      alert(`检测到文件格式 .${ext}。系统支持的格式包括: EPUB, PDF, TXT, MOBI, AZW3。\n不支持受 DRM 商业数字版权加密保护的专有格式。`);
      return;
    }

    try {
      setUploadingBook(true);
      const res = await api.uploadFile(file);
      // Create book in shelf
      await api.addBook({
        title: file.name.replace(/\.[^/.]+$/, ''),
        author: '本地录入',
        category: '私藏电子书',
        cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        totalPages: 100,
        currentPage: 1,
        progress: 1,
        format: ext as any,
        fileUrl: res.url,
        fileSize: res.size,
        description: `由本地上传的电子书：${file.name}`,
        chapters: [
          {
            title: '第一章 · 导入导读',
            content: `本书籍 ${file.name} 已成功上载到 fox 个人数字书架。支持直接全屏阅读及多端在线下载。\n格式: .${ext} | 大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`
          }
        ]
      });
      if (onRefresh) onRefresh();
      alert('电子书已成功上传并收录至个人书架！');
    } catch (err: any) {
      alert('上传电子书失败: ' + err.message);
    } finally {
      setUploadingBook(false);
    }
  };

  const handleDownloadBook = (book: Book) => {
    // Generate simulated text download or redirect to fileUrl
    const blob = new Blob([
      `【${book.title}】 - 作者: ${book.author}\n\n${book.chapters.map(c => `### ${c.title}\n\n${c.content}`).join('\n\n')}`
    ], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title}.${book.format || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Bookshelf Ribbon: Upload, Format Info & Guide */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-emerald-900/10 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>📚 随身私藏数字书架</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-normal">
              支持 EPUB / PDF / TXT
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            本地电子书极速上传与多端进度同步，移动端全屏研读体验。
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFormatGuide(!showFormatGuide)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>格式支持说明</span>
          </button>

          {isAdmin && (
            <label className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 cursor-pointer shadow-xs transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingBook ? '上传解析中...' : '上传本地电子书'}</span>
              <input
                type="file"
                accept=".epub,.pdf,.txt,.mobi,.azw3"
                onChange={handleUploadEBook}
                className="hidden"
                disabled={uploadingBook}
              />
            </label>
          )}
        </div>
      </div>

      {/* Format Explanation Guide Box */}
      {showFormatGuide && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-slate-700 space-y-2">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            电子书格式兼容说明：
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600">
            <div>
              <strong className="text-emerald-800">✅ 完美支持的格式：</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li><strong>.EPUB</strong>：现代电子出版标准，支持章节流式排版；</li>
                <li><strong>.PDF</strong>：版面固定文档，图文严谨对照；</li>
                <li><strong>.TXT</strong>：纯文本格式，极轻量无依赖。</li>
                <li><strong>.MOBI / .AZW3</strong>：Kindle 常见标准格式。</li>
              </ul>
            </div>
            <div>
              <strong className="text-rose-700">❌ 暂不支持的格式：</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>受 DRM 加密的商业专有数字版权保护文件；</li>
                <li>损坏或加密口令保护的压缩归档。</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
          <div
            key={book.id}
            className="bg-white rounded-xl border border-emerald-900/10 hover:border-emerald-500 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden group"
          >
            <div className="flex p-4 gap-4 flex-1">
              {/* Cover */}
              <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 shadow-2xs border border-slate-100">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold uppercase">
                    {book.format || 'EPUB'} · {book.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1 group-hover:text-emerald-700 transition">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {book.description}
                  </p>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>研读进度</span>
                    <span className="font-mono text-emerald-700 font-bold">{book.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setSelectedBook(book);
                  setActiveChapterIndex(0);
                }}
                className="flex items-center space-x-1 text-emerald-700 font-medium hover:text-emerald-800"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>沉浸研读</span>
              </button>

              <button
                onClick={() => handleDownloadBook(book)}
                title="离线下载电子书"
                className="flex items-center space-x-1 text-slate-500 hover:text-emerald-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载副本</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal (Supports Mobile Fullscreen without obscuring top header/notch) */}
      {selectedBook && (
        <div className={`fixed inset-0 z-50 bg-white flex flex-col ${
          isMobileFullscreen
            ? 'pt-safe pb-safe overflow-hidden'
            : 'p-4 sm:p-8 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center'
        }`}>
          <div className={`bg-white flex flex-col ${
            isMobileFullscreen
              ? 'w-full h-full'
              : 'max-w-4xl w-full h-[85vh] rounded-xl shadow-2xl border border-emerald-900/20 overflow-hidden'
          }`}>
            {/* Top Toolbar (Respects safe area on mobile) */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-[#f8faf9] flex-shrink-0">
              <div className="flex items-center space-x-2 truncate">
                <span className="text-base font-bold text-slate-800 truncate">
                  {selectedBook.title}
                </span>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-xs text-emerald-700 font-medium truncate">
                  {selectedBook.chapters[activeChapterIndex]?.title}
                </span>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Mobile Fullscreen Toggle Button */}
                <button
                  onClick={() => setIsMobileFullscreen(!isMobileFullscreen)}
                  title={isMobileFullscreen ? '退出手机全屏' : '手机全屏研读 (不挡顶栏)'}
                  className="p-1.5 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-slate-200 transition"
                >
                  {isMobileFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setSelectedBook(null)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reader Content Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Chapter Directory Sidebar */}
              <div className="w-60 border-r border-slate-200 bg-slate-50/50 p-3 overflow-y-auto hidden md:block flex-shrink-0">
                <div className="text-xs font-bold text-slate-600 mb-2">章节目录</div>
                <div className="space-y-1">
                  {selectedBook.chapters.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveChapterIndex(idx);
                        onUpdateProgress(selectedBook.id, idx + 1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition ${
                        activeChapterIndex === idx
                          ? 'bg-emerald-600 text-white font-medium'
                          : 'text-slate-600 hover:bg-emerald-50'
                      }`}
                    >
                      {ch.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Render Area */}
              <div className="flex-1 p-6 sm:p-10 overflow-y-auto font-serif leading-loose text-slate-800 text-sm sm:text-base">
                <h2 className="text-xl font-bold font-sans text-slate-900 pb-4 mb-6 border-b border-slate-100">
                  {selectedBook.chapters[activeChapterIndex]?.title}
                </h2>
                <div className="whitespace-pre-line">
                  {selectedBook.chapters[activeChapterIndex]?.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
