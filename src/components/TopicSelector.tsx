import React, { useState } from 'react';
import { GameDifficulty, TopicId } from '../types';
import { TOPICS } from '../data/defaultQuestions';
import { getStoredQuestions } from '../utils/questionStorage';
import { ArrowLeft, Play, ShieldAlert, Award, Zap, BookOpen } from 'lucide-react';

interface TopicSelectorProps {
  onBack: () => void;
  onStartGame: (topicId: TopicId, difficulty: GameDifficulty) => void;
  onOpenQuestionManager: () => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  onBack,
  onStartGame,
  onOpenQuestionManager,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicId>('it');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const questions = getStoredQuestions();

  const getQuestionCount = (tid: TopicId) => {
    if (tid === 'all') return questions.length;
    return questions.filter(q => q.topic === tid).length;
  };

  const handleStart = () => {
    const count = getQuestionCount(selectedTopic);
    if (count === 0) {
      alert('Chủ đề này chưa có câu hỏi nào! Hãy vào phần "Quản lý câu hỏi" để thêm mới câu hỏi nhé.');
      return;
    }
    onStartGame(selectedTopic, difficulty);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto w-full">
        {/* Top nav */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <button
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-yellow-400 flex items-center gap-2 text-sm font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Menu
          </button>

          <button
            onClick={onOpenQuestionManager}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-800/80 hover:bg-cyan-950 text-cyan-300 flex items-center gap-2 text-sm transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" /> Quản lý câu hỏi
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono tracking-widest uppercase mb-2">
            MỤC TIÊU CHIẾN DỊCH
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 font-['Chakra_Petch',sans-serif] tracking-wider uppercase">
            CHỌN CHỦ ĐỀ ÔN TẬP VÀ ĐỘ KHÓ
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Hệ thống sẽ lấy các câu hỏi thuộc chủ đề bạn chọn để tạo thành rào chắn phong ấn cản đường trong màn chơi!
          </p>
        </div>

        {/* Section 1: Topic Grid */}
        <div className="mb-8">
          <h2 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
            1. Chọn Chủ Đề Thử Thách:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TOPICS.map(topic => {
              const isSelected = selectedTopic === topic.id;
              const count = getQuestionCount(topic.id);
              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'border-yellow-400 bg-gradient-to-b from-yellow-500/15 to-slate-900 shadow-lg shadow-yellow-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      {topic.icon}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                        isSelected
                          ? 'bg-yellow-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count} câu
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-yellow-300 transition">
                    {topic.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{topic.description}</p>

                  {isSelected && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-yellow-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Đang chọn
                    </div>
                  )}
                </div>
              );
            })}

            {/* All Topics option */}
            <div
              onClick={() => setSelectedTopic('all')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                selectedTopic === 'all'
                  ? 'border-yellow-400 bg-gradient-to-b from-yellow-500/15 to-slate-900 shadow-lg shadow-yellow-500/10'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  🌟
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                    selectedTopic === 'all'
                      ? 'bg-yellow-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {getQuestionCount('all')} câu
                </span>
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-yellow-300 transition">
                Tổng hợp Tất cả Chủ đề
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ngẫu nhiên trộn lẫn tất cả câu hỏi từ Tin học, Toán, Anh, Sử, Khoa học...
              </p>
              {selectedTopic === 'all' && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-yellow-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Đang chọn
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
            2. Chọn Cấp Độ Thử Thách:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Easy */}
            <div
              onClick={() => setDifficulty('easy')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                difficulty === 'easy'
                  ? 'border-emerald-400 bg-emerald-950/20 text-emerald-200 shadow-md shadow-emerald-500/10'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-base text-emerald-400 mb-1">
                <ShieldAlert className="w-5 h-5" /> CẤP DỄ (Học viên)
              </div>
              <p className="text-xs text-slate-300 mb-2">3 Cổng Phong Ấn • Quái vật đi chậm • Rơi nhiều hòm tiếp tế</p>
              <div className="text-[11px] font-mono text-emerald-300/80">Thích hợp làm quen điều khiển & ôn bài</div>
            </div>

            {/* Medium */}
            <div
              onClick={() => setDifficulty('medium')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                difficulty === 'medium'
                  ? 'border-amber-400 bg-amber-950/20 text-amber-200 shadow-md shadow-amber-500/10'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-base text-amber-400 mb-1">
                <Zap className="w-5 h-5" /> TRUNG BÌNH (Chiến binh)
              </div>
              <p className="text-xs text-slate-300 mb-2">5 Cổng Phong Ấn • Lính tuần tra & Ụ súng tĩnh • Nhịp độ chuẩn</p>
              <div className="text-[11px] font-mono text-amber-300/80">Trải nghiệm Arcade Contra nguyên bản</div>
            </div>

            {/* Hard */}
            <div
              onClick={() => setDifficulty('hard')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                difficulty === 'hard'
                  ? 'border-rose-500 bg-rose-950/20 text-rose-200 shadow-md shadow-rose-500/10'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-base text-rose-400 mb-1">
                <Award className="w-5 h-5" /> CỰC KHÓ (Bậc thầy)
              </div>
              <p className="text-xs text-slate-300 mb-2">7 Cổng Phong Ấn • Đạn dày • Xuất hiện Trùm Alien Mecha Tank cuối</p>
              <div className="text-[11px] font-mono text-rose-300/80">Dành cho cao thủ phản xạ và trí tuệ đỉnh cao</div>
            </div>
          </div>
        </div>

        {/* Start Game Action */}
        <div className="text-center pt-2">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-lg sm:text-xl uppercase tracking-widest shadow-2xl shadow-orange-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer font-['Chakra_Petch',sans-serif]"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            BẮT ĐẦU CHIẾN DỊCH
          </button>
        </div>
      </div>
    </div>
  );
};
