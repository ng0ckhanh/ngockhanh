import React, { useState } from 'react';
import { Question, TopicId } from '../types';
import { TOPICS } from '../data/defaultQuestions';
import {
  getStoredQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  resetQuestionsToDefault,
} from '../utils/questionStorage';
import {
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Search,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Layers,
  Sparkles,
} from 'lucide-react';

interface QuestionManagerProps {
  onBack: () => void;
  onStartGameWithTopic?: (topic: TopicId) => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ onBack, onStartGameWithTopic }) => {
  const [questions, setQuestions] = useState<Question[]>(getStoredQuestions());
  const [selectedTopic, setSelectedTopic] = useState<TopicId>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form input states
  const [formTopic, setFormTopic] = useState<TopicId>('it');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState<number>(0);
  const [formHint, setFormHint] = useState('');
  const [formError, setFormError] = useState('');

  // Delete confirm modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filtered list
  const filteredQuestions = questions.filter(q => {
    const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.options.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTopic && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormTopic(selectedTopic === 'all' ? 'it' : selectedTopic);
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrect(0);
    setFormHint('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormTopic(q.topic);
    setFormQuestion(q.question);
    setFormOptions([...q.options] as [string, string, string, string]);
    setFormCorrect(q.correctAnswer);
    setFormHint(q.hint || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      setFormError('Vui lòng nhập nội dung câu hỏi!');
      return;
    }
    if (formOptions.some(opt => !opt.trim())) {
      setFormError('Vui lòng điền đủ 4 phương án lựa chọn A, B, C, D!');
      return;
    }

    if (editingQuestion) {
      const updated = updateQuestion(editingQuestion.id, {
        topic: formTopic,
        question: formQuestion.trim(),
        options: formOptions.map(o => o.trim()) as [string, string, string, string],
        correctAnswer: formCorrect,
        hint: formHint.trim(),
      });
      setQuestions(updated);
    } else {
      addQuestion({
        topic: formTopic,
        question: formQuestion.trim(),
        options: formOptions.map(o => o.trim()) as [string, string, string, string],
        correctAnswer: formCorrect,
        hint: formHint.trim(),
      });
      setQuestions(getStoredQuestions());
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (id: string) => {
    const updated = deleteQuestion(id);
    setQuestions(updated);
    setDeleteTargetId(null);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục danh sách câu hỏi mặc định? Các câu hỏi đã tự thêm sẽ bị ghi đè.')) {
      const reset = resetQuestionsToDefault();
      setQuestions(reset);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 font-sans">
      {/* Header bar */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-yellow-400 hover:text-yellow-300 transition-all flex items-center gap-2 font-mono text-sm shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại Menu
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-500 tracking-wide font-['Chakra_Petch',sans-serif] uppercase">
                QUẢN LÝ CÂU HỎI TRẮC NGHIỆM
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Thêm, sửa, xóa đề thi theo chủ đề • Dữ liệu lưu tự động vào trình duyệt (localStorage)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              title="Khôi phục danh sách câu hỏi gốc"
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              Khôi phục gốc
            </button>

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm câu hỏi mới
            </button>
          </div>
        </div>

        {/* Topic Filters & Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mb-6">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedTopic === 'all'
                ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="text-lg mb-1">🌟</div>
            <div className="font-bold text-xs uppercase tracking-wider">Tất cả</div>
            <div className="text-xs text-amber-400 font-mono mt-0.5">{questions.length} câu hỏi</div>
          </button>

          {TOPICS.map(topic => {
            const count = questions.filter(q => q.topic === topic.id).length;
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-lg mb-1">{topic.icon}</div>
                <div className="font-bold text-xs truncate">{topic.name}</div>
                <div className="text-xs text-cyan-400 font-mono mt-0.5">{count} câu hỏi</div>
              </button>
            );
          })}
        </div>

        {/* Search bar & count summary */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung câu hỏi hoặc đáp án..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="text-xs text-slate-400 px-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Đang hiển thị <span className="font-bold text-amber-300">{filteredQuestions.length}</span> câu hỏi
            {selectedTopic !== 'all' && (
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                {TOPICS.find(t => t.id === selectedTopic)?.name}
              </span>
            )}
          </div>
        </div>

        {/* Questions list */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-medium">Không tìm thấy câu hỏi nào phù hợp</p>
            <p className="text-xs text-slate-500 mt-1">Hãy thử đổi bộ lọc chủ đề hoặc bấm nút "Thêm câu hỏi mới"</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredQuestions.map((q, idx) => {
              const topicMeta = TOPICS.find(t => t.id === q.topic);
              return (
                <div
                  key={q.id}
                  className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-medium flex items-center gap-1 border border-cyan-800/40">
                        <span>{topicMeta?.icon}</span>
                        {topicMeta?.name || 'Khác'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(q)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-900/40 text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-700 text-xs flex items-center gap-1 transition cursor-pointer"
                        title="Sửa câu hỏi"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Sửa
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(q.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700 text-xs flex items-center gap-1 transition cursor-pointer"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-slate-100 mb-3 leading-relaxed">
                    {q.question}
                  </p>

                  {/* 4 Options grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctAnswer;
                      const letter = ['A', 'B', 'C', 'D'][optIdx];
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2 ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                              : 'bg-slate-950/50 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 break-words">{opt}</span>
                          {isCorrect && (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-1 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.hint && (
                    <div className="bg-amber-950/30 border border-amber-900/40 rounded-xl px-3 py-1.5 text-xs text-amber-300/90 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        <strong className="text-amber-300">Gợi ý:</strong> {q.hint}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-yellow-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {editingQuestion ? 'CẬP NHẬT CÂU HỎI' : 'THÊM MỚI CÂU HỎI TRẮC NGHIỆM'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-rose-950/80 border border-rose-500 text-rose-200 text-xs sm:text-sm p-3 rounded-xl mb-4">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Select Topic */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Chủ đề câu hỏi:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TOPICS.map(topic => (
                    <button
                      type="button"
                      key={topic.id}
                      onClick={() => setFormTopic(topic.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer transition ${
                        formTopic === topic.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{topic.icon}</span>
                      <span className="truncate">{topic.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nội dung câu hỏi:
                </label>
                <textarea
                  value={formQuestion}
                  onChange={e => setFormQuestion(e.target.value)}
                  placeholder="Nhập nội dung câu đố/câu hỏi..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 4 Options & Correct Answer Radio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  4 Phương án lựa chọn (Click chọn đáp án ĐÚNG):
                </label>
                <div className="space-y-2">
                  {(['A', 'B', 'C', 'D'] as const).map((letter, idx) => {
                    const isSelectedCorrect = formCorrect === idx;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                          isSelectedCorrect
                            ? 'bg-emerald-950/30 border-emerald-500'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setFormCorrect(idx)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer transition ${
                            isSelectedCorrect
                              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                          title={`Chọn phương án ${letter} làm đáp án ĐÚNG`}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={formOptions[idx]}
                          onChange={e => {
                            const newOpts = [...formOptions] as [string, string, string, string];
                            newOpts[idx] = e.target.value;
                            setFormOptions(newOpts);
                          }}
                          placeholder={`Nội dung phương án ${letter}...`}
                          className="flex-1 bg-transparent border-none text-sm text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setFormCorrect(idx)}
                          className={`text-xs px-2 py-1 rounded-md cursor-pointer ${
                            isSelectedCorrect
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {isSelectedCorrect ? '✓ Đáp án đúng' : 'Đặt làm đáp án đúng'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hint */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Gợi ý giải thích (hiển thị khi người chơi trả lời sai):
                </label>
                <input
                  type="text"
                  value={formHint}
                  onChange={e => setFormHint(e.target.value)}
                  placeholder="Gợi ý thêm để hỗ trợ người chơi suy luận..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md cursor-pointer"
                >
                  {editingQuestion ? 'Lưu thay đổi' : 'Tạo câu hỏi mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Xác nhận xóa câu hỏi?</h3>
            <p className="text-xs text-slate-400 mb-5">
              Hành động này sẽ xóa vĩnh viễn câu hỏi khỏi ngân hàng đề thi trong bộ nhớ trình duyệt.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => confirmDelete(deleteTargetId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
