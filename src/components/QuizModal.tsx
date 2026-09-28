import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { sound } from '../utils/audio';
import { ShieldAlert, CheckCircle2, XCircle, Lightbulb, Lock, Unlock, Sparkles } from 'lucide-react';

interface QuizModalProps {
  question: Question;
  gateIndex: number;
  totalGates: number;
  onAnswerCorrect: () => void;
  onAnswerWrong: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  question,
  gateIndex,
  totalGates,
  onAnswerCorrect,
  onAnswerWrong,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Play lock barrier alarm sound when question modal opens
    sound.playGateAlarm();
  }, []);

  const handleSelectOption = (idx: number) => {
    if (isSuccess) return;
    setSelectedOption(idx);

    if (idx === question.correctAnswer) {
      // Correct!
      setIsWrong(false);
      setIsSuccess(true);
      sound.playCorrect();
      setTimeout(() => {
        onAnswerCorrect();
      }, 1200);
    } else {
      // Wrong!
      setIsWrong(true);
      setShowHint(true);
      setShake(true);
      sound.playWrong();
      onAnswerWrong();
      setTimeout(() => setShake(false), 500);
    }
  };

  // Keyboard support: 1, 2, 3, 4 or A, B, C, D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess) return;
      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') handleSelectOption(0);
      else if (key === '2' || key === 'B') handleSelectOption(1);
      else if (key === '3' || key === 'C') handleSelectOption(2);
      else if (key === '4' || key === 'D') handleSelectOption(3);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSuccess, question]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div
        className={`max-w-xl w-full bg-slate-900 border-2 rounded-3xl p-5 sm:p-7 shadow-2xl relative transition-all duration-300 ${
          shake ? 'animate-bounce border-rose-500 shadow-rose-900/50' : ''
        } ${
          isSuccess
            ? 'border-emerald-400 bg-gradient-to-b from-emerald-950/40 to-slate-900 shadow-emerald-500/20'
            : isWrong
            ? 'border-rose-500 bg-gradient-to-b from-rose-950/40 to-slate-900'
            : 'border-yellow-400/80 shadow-yellow-500/10'
        }`}
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              {isSuccess ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-amber-400" />}
            </span>
            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                CỔNG PHONG ẤN #{gateIndex} / {totalGates}
              </div>
              <div className="text-sm font-bold text-slate-200">
                GIẢI MÃ CÂU ĐỐ ĐỂ PHÁ HỦY RÀO CHẮN
              </div>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono font-bold text-cyan-300 border border-slate-700">
            PAUSED ⏸️
          </div>
        </div>

        {/* Question Statement */}
        <div className="mb-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <p className="text-base sm:text-lg font-bold text-white leading-relaxed font-sans">
            {question.question}
          </p>
        </div>

        {/* Status Alerts */}
        {isWrong && !isSuccess && (
          <div className="mb-4 bg-rose-950/80 border border-rose-500/80 rounded-xl p-3 text-xs sm:text-sm text-rose-200 flex items-start gap-2 animate-pulse">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>CHƯA CHÍNH XÁC!</strong> Rào chắn chưa mở. Hãy đọc gợi ý bên dưới và chọn lại phương án đúng!
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="mb-4 bg-emerald-950/80 border border-emerald-500/80 rounded-xl p-3 text-xs sm:text-sm text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong>CHÍNH XÁC!</strong> Rào chắn phong ấn đang phát nổ... Tiếp tục tiến công!
            </div>
          </div>
        )}

        {/* Options 4 Choices */}
        <div className="space-y-2.5 mb-5">
          {(['A', 'B', 'C', 'D'] as const).map((letter, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === question.correctAnswer;
            let btnStyle = 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 text-slate-200';

            if (isSuccess && isCorrectOption) {
              btnStyle = 'border-emerald-400 bg-emerald-950/80 text-emerald-200 ring-2 ring-emerald-400';
            } else if (isWrong && isSelected && !isCorrectOption) {
              btnStyle = 'border-rose-500 bg-rose-950/80 text-rose-200';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isSuccess}
                className={`w-full p-3.5 rounded-2xl border-2 text-left text-sm sm:text-base font-medium flex items-center gap-3 transition-all cursor-pointer ${btnStyle}`}
              >
                <span
                  className={`w-7 h-7 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 ${
                    isSuccess && isCorrectOption
                      ? 'bg-emerald-400 text-slate-950'
                      : isWrong && isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {letter}
                </span>
                <span className="flex-1 break-words">{question.options[idx]}</span>
                {isSuccess && isCorrectOption && (
                  <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" />
                )}
              </button>
            );
          })}
        </div>

        {/* Hint Section */}
        {showHint && question.hint && (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 text-xs sm:text-sm text-amber-200 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Gợi ý trợ giúp: </span>
              {question.hint}
            </div>
          </div>
        )}

        {/* Keyboard instruction hint */}
        <div className="text-center text-[11px] text-slate-500 mt-3 font-mono">
          Bấm phím [1, 2, 3, 4] hoặc [A, B, C, D] trên bàn phím để chọn nhanh
        </div>
      </div>
    </div>
  );
};
