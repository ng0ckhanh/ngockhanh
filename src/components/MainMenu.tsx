import React, { useState } from 'react';
import { Play, BookOpen, HelpCircle, Volume2, VolumeX, Shield, Zap, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';
import { getStoredQuestions } from '../utils/questionStorage';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenQuestionManager: () => void;
  onOpenInstruction: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenQuestionManager,
  onOpenInstruction,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const questionsCount = getStoredQuestions().length;

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sound.playItemPickup();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden select-none font-sans">
      {/* Background Animated Retro Grid & Atmosphere */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar with Sound toggle & version */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-mono text-slate-400 tracking-wider">ARCADE EDITION 2026</span>
        </div>

        <button
          onClick={toggleSound}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-2 text-xs font-mono cursor-pointer transition shadow-md"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" /> Âm thanh: BẬT
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-500" /> Âm thanh: TẮT
            </>
          )}
        </button>
      </div>

      {/* Hero Banner / Logo */}
      <div className="max-w-2xl w-full text-center z-10 my-auto py-8">
        {/* Contra Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-lg shadow-red-900/20 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> GAME BẮN SÚNG HÀNH ĐỘNG & HỌC TẬP
        </div>

        {/* Big Retro Game Title */}
        <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-wider font-['Chakra_Petch',sans-serif] leading-none mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-orange-400 to-amber-300 drop-shadow-[0_4px_16px_rgba(239,68,68,0.5)]">
            CONTRA
          </span>
          <span className="block text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 font-extrabold tracking-widest mt-1">
            KIẾN THỨC
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8 font-medium">
          Tiêu diệt kẻ địch tuần tra • Thu thập súng Spread & Laser • Giải mã Cổng Phong Ấn trắc nghiệm để tiến công!
        </p>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-8">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-lg sm:text-xl uppercase tracking-widest shadow-2xl shadow-orange-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer font-['Chakra_Petch',sans-serif]"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            CHIẾN ĐẤU NGAY
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          {/* Question Manager Button (Phần 1) */}
          <button
            onClick={onOpenQuestionManager}
            className="w-full sm:w-auto flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-500/60 hover:bg-slate-800 text-cyan-300 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            QUẢN LÝ CÂU HỎI ({questionsCount})
          </button>

          {/* Instructions Button */}
          <button
            onClick={onOpenInstruction}
            className="w-full sm:w-auto flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-500/60 hover:bg-slate-800 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            HƯỚNG DẪN & PHÍM
          </button>
        </div>
      </div>

      {/* Feature Highlights Pills at Bottom */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 z-10 pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-center">
          <div className="text-amber-400 font-bold text-xs uppercase mb-0.5">💥 3 LOẠI VŨ KHÍ</div>
          <div className="text-[11px] text-slate-400">Rifle thường, Súng S chùm 3 tia & Súng L Laser xuyên thấu</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-center">
          <div className="text-cyan-400 font-bold text-xs uppercase mb-0.5">🛡️ KỸ NĂNG MANA</div>
          <div className="text-[11px] text-slate-400">Phím K kích hoạt Khiên Bất Tử hoặc Mega Bom quét sạch địch</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-center">
          <div className="text-indigo-400 font-bold text-xs uppercase mb-0.5">🌅 CHU KỲ NGÀY ĐÊM</div>
          <div className="text-[11px] text-slate-400">Tự động đổi cảnh mượt mà, ban đêm có quầng sáng soi đường</div>
        </div>
      </div>
    </div>
  );
};
