import React, { useState } from 'react';
import { Book } from '../types';
import { BookOpen, CheckCircle, ChevronRight, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface BookshelfViewProps {
  books: Book[];
  onUpdateProgress: (bookId: string, page: number) => void;
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  books,
  onUpdateProgress,
}) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  const openBook = (book: Book) => {
    setSelectedBook(book);
    setActiveChapterIndex(0);
  };

  const handleNextPage = () => {
    if (!selectedBook) return;
    const newPage = Math.min(selectedBook.totalPages, selectedBook.currentPage + 1);
    onUpdateProgress(selectedBook.id, newPage);
    setSelectedBook({
      ...selectedBook,
      currentPage: newPage,
      progress: Math.round((newPage / selectedBook.totalPages) * 100),
    });
  };

  const handlePrevPage = () => {
    if (!selectedBook) return;
    const newPage = Math.max(1, selectedBook.currentPage - 1);
    onUpdateProgress(selectedBook.id, newPage);
    setSelectedBook({
      ...selectedBook,
      currentPage: newPage,
      progress: Math.round((newPage / selectedBook.totalPages) * 100),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">白狐随身书架</h2>
          <p className="text-xs text-slate-500 mt-0.5">多端进度持久化同步 · 纯净阅读体验</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
          <div
            key={book.id}
            className="bg-white rounded-2xl border border-rose-100/80 p-5 shadow-xs hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between"
          >
            <div className="flex space-x-4">
              <img
                src={book.cover}
                alt={book.title}
                className="w-24 h-32 object-cover rounded-xl shadow-md border border-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  {book.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 truncate mt-1">{book.title}</h3>
                <p className="text-xs text-slate-500 truncate">{book.author}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500">
                  进度: 第 {book.currentPage} / {book.totalPages} 页
                </span>
                <span className="font-bold text-emerald-600">{book.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${book.progress}%` }}
                />
              </div>

              <button
                onClick={() => openBook(book)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>立即开卷研读</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📖</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{selectedBook.title}</h3>
                  <p className="text-[11px] text-slate-500">{selectedBook.author} · 第 {selectedBook.currentPage} 页</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chapters Navigation Tabs */}
            <div className="px-6 py-2 border-b border-slate-100 flex items-center space-x-2 overflow-x-auto bg-white scrollbar-none">
              {selectedBook.chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeChapterIndex === idx
                      ? 'bg-rose-50 text-rose-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ch.title}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 font-serif text-slate-800 leading-relaxed text-sm sm:text-base whitespace-pre-line bg-[#fdfbf7]">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-stone-200">
                {selectedBook.chapters[activeChapterIndex]?.title || '阅读'}
              </h4>
              <p>{selectedBook.chapters[activeChapterIndex]?.content || '暂无内容'}</p>
            </div>

            {/* Footer with page update controls */}
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-white text-xs">
              <button
                onClick={handlePrevPage}
                disabled={selectedBook.currentPage <= 1}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>上一页</span>
              </button>

              <div className="flex items-center space-x-2 text-slate-500">
                <span>当前进度:</span>
                <span className="font-bold text-rose-600">{selectedBook.progress}%</span>
                <span>(实时保存至服务端)</span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={selectedBook.currentPage >= selectedBook.totalPages}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium disabled:opacity-40"
              >
                <span>下一页</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
