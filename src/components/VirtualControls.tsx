import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Crosshair, Shield, Bomb } from 'lucide-react';

interface VirtualControlsProps {
  onKeyDown: (code: string) => void;
  onKeyUp: (code: string) => void;
  onTriggerSkill: (skill: 'shield' | 'bomb') => void;
  mana: number;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onKeyDown,
  onKeyUp,
  onTriggerSkill,
  mana,
}) => {
  return (
    <div className="fixed bottom-3 left-0 right-0 px-4 flex items-end justify-between pointer-events-none select-none z-30 sm:hidden">
      {/* Left side: Directional controls (Left, Right, Jump, Duck) */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5 bg-slate-950/60 p-2 rounded-3xl backdrop-blur-sm border border-slate-800">
        <button
          onTouchStart={() => onKeyDown('ArrowUp')}
          onTouchEnd={() => onKeyUp('ArrowUp')}
          onMouseDown={() => onKeyDown('ArrowUp')}
          onMouseUp={() => onKeyUp('ArrowUp')}
          className="w-12 h-12 rounded-2xl bg-slate-800 active:bg-slate-700 text-yellow-400 flex items-center justify-center border border-slate-700 shadow-md"
          title="Nhảy (Up)"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onTouchStart={() => onKeyDown('ArrowLeft')}
            onTouchEnd={() => onKeyUp('ArrowLeft')}
            onMouseDown={() => onKeyDown('ArrowLeft')}
            onMouseUp={() => onKeyUp('ArrowLeft')}
            className="w-12 h-12 rounded-2xl bg-slate-800 active:bg-slate-700 text-yellow-400 flex items-center justify-center border border-slate-700 shadow-md"
            title="Trái"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            onTouchStart={() => onKeyDown('ArrowDown')}
            onTouchEnd={() => onKeyUp('ArrowDown')}
            onMouseDown={() => onKeyDown('ArrowDown')}
            onMouseUp={() => onKeyUp('ArrowDown')}
            className="w-12 h-12 rounded-2xl bg-slate-800 active:bg-slate-700 text-yellow-400 flex items-center justify-center border border-slate-700 shadow-md"
            title="Cúi người né đạn"
          >
            <ArrowDown className="w-6 h-6" />
          </button>

          <button
            onTouchStart={() => onKeyDown('ArrowRight')}
            onTouchEnd={() => onKeyUp('ArrowRight')}
            onMouseDown={() => onKeyDown('ArrowRight')}
            onMouseUp={() => onKeyUp('ArrowRight')}
            className="w-12 h-12 rounded-2xl bg-slate-800 active:bg-slate-700 text-yellow-400 flex items-center justify-center border border-slate-700 shadow-md"
            title="Phải"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Right side: Action buttons (Shoot, Jump, Shield, Bomb) */}
      <div className="pointer-events-auto flex items-end gap-2 bg-slate-950/60 p-2 rounded-3xl backdrop-blur-sm border border-slate-800">
        <div className="flex flex-col gap-2">
          {/* Mana Bomb */}
          <button
            onClick={() => onTriggerSkill('bomb')}
            disabled={mana < 40}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold border transition ${
              mana >= 40
                ? 'bg-rose-600 active:bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-900/50'
                : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50'
            }`}
            title="Mega Bom (40 Mana)"
          >
            <Bomb className="w-5 h-5" />
          </button>

          {/* Mana Shield */}
          <button
            onClick={() => onTriggerSkill('shield')}
            disabled={mana < 30}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold border transition ${
              mana >= 30
                ? 'bg-cyan-600 active:bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-900/50'
                : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50'
            }`}
            title="Khiên Hộ Thể (30 Mana)"
          >
            <Shield className="w-5 h-5" />
          </button>
        </div>

        {/* Jump Button */}
        <button
          onTouchStart={() => onKeyDown('Space')}
          onTouchEnd={() => onKeyUp('Space')}
          onMouseDown={() => onKeyDown('Space')}
          onMouseUp={() => onKeyUp('Space')}
          className="w-14 h-14 rounded-2xl bg-amber-500 active:bg-amber-400 text-slate-950 font-black flex items-center justify-center border-2 border-amber-300 shadow-lg shadow-amber-900/40 text-sm"
          title="Nhảy (Space)"
        >
          JUMP
        </button>

        {/* Shoot Button */}
        <button
          onTouchStart={() => onKeyDown('KeyJ')}
          onTouchEnd={() => onKeyUp('KeyJ')}
          onMouseDown={() => onKeyDown('KeyJ')}
          onMouseUp={() => onKeyUp('KeyJ')}
          className="w-16 h-16 rounded-2xl bg-rose-600 active:bg-rose-500 text-white font-black flex flex-col items-center justify-center border-2 border-rose-400 shadow-xl shadow-rose-900/50"
          title="Bắn Đạn (J)"
        >
          <Crosshair className="w-6 h-6 mb-0.5" />
          <span className="text-[10px] tracking-wider uppercase font-mono">FIRE</span>
        </button>
      </div>
    </div>
  );
};
