import React from 'react';
import { X, Gamepad2, Shield, Crosshair, ArrowUp, ArrowDown, HelpCircle, Zap } from 'lucide-react';

interface InstructionModalProps {
  onClose: () => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-500 font-['Chakra_Petch',sans-serif] tracking-wider uppercase">
              CẨM NANG CHIẾN BINH CONTRA
            </h2>
            <p className="text-xs text-slate-400">Điều khiển nhân vật, trang bị vũ khí và vượt rào cản tri thức</p>
          </div>
        </div>

        {/* Section 1: Keys */}
        <div className="mb-6">
          <h3 className="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-3 flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> BẢNG PHÍM ĐIỀU KHIỂN
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-slate-300">Di chuyển Trái / Phải</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400 font-bold">A</kbd>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400 font-bold">D</kbd>
                <span className="text-slate-500">hoặc</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400 font-bold">←</kbd>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400 font-bold">→</kbd>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-slate-300">Nhảy lên bậc cao</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400 font-bold">W</kbd>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400 font-bold">Space</kbd>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400 font-bold">↑</kbd>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-slate-300">Cúi người né đường đạn</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400 font-bold">S</kbd>
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400 font-bold">↓</kbd>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-slate-300">Bắn đạn thẳng / chéo</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-rose-400 font-bold">J</kbd>
                <span className="text-slate-500">hoặc</span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-rose-400 font-bold">Click</span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-slate-300">Kỹ năng Khiên Hộ Thể (Mana)</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-400 font-bold">K</kbd>
                <span className="text-[11px] text-cyan-400 font-mono ml-1">(30 Mana)</span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-slate-300">Kỹ năng Mega Bom Nổ (Mana)</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-rose-400 font-bold">B</kbd>
                <span className="text-[11px] text-rose-400 font-mono ml-1">(40 Mana)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Items */}
        <div className="mb-6">
          <h3 className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-3">
            HỘP TIẾP TẾ BAY & VẬT PHẨM (DROP ITEMS)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-emerald-500/30 p-3 rounded-2xl">
              <div className="text-2xl mb-1">🍄</div>
              <div className="font-bold text-emerald-400 text-xs sm:text-sm">NẤM THẦN KỲ</div>
              <div className="text-xs text-slate-300 mt-1">
                Hồi phục tức thì <strong>100% Máu (HP)</strong> và <strong>100% Năng lượng (Mana)</strong>.
              </div>
            </div>

            <div className="bg-slate-950/80 border border-rose-500/30 p-3 rounded-2xl">
              <div className="text-2xl mb-1">💥 [S]</div>
              <div className="font-bold text-rose-400 text-xs sm:text-sm">SÚNG S (SPREAD GUN)</div>
              <div className="text-xs text-slate-300 mt-1">
                Bắn đạn chùm tỏa 3 tia quét sạch kẻ địch trên diện rộng.
              </div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/30 p-3 rounded-2xl">
              <div className="text-2xl mb-1">⚡ [L]</div>
              <div className="font-bold text-cyan-400 text-xs sm:text-sm">SÚNG L (LASER GUN)</div>
              <div className="text-xs text-slate-300 mt-1">
                Bắn chùm tia laser dài uy lực cao, xuyên thấu qua mọi kẻ địch.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Quizzes and Day/Night */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-950/80 border border-yellow-500/30 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 font-bold text-yellow-400 text-xs sm:text-sm mb-1.5">
              <HelpCircle className="w-4 h-4 text-yellow-400" />
              CỔNG PHONG ẤN TRẮC NGHIỆM
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mỗi khi chạm Cổng Phong Ấn, game đóng băng. Bạn phải trả lời ĐÚNG câu hỏi để phá hủy cổng đi tiếp. Nếu sai sẽ có gợi ý và chọn lại!
            </p>
          </div>

          <div className="bg-slate-950/80 border border-indigo-500/30 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 font-bold text-indigo-400 text-xs sm:text-sm mb-1.5">
              <span>🌅 ➔ 🌙</span>
              CHU KỲ NGÀY SANG ĐÊM
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mỗi 35 giây bầu trời chuyển từ ban ngày xanh ngát sang hoàng hôn đỏ cam và đêm tối tĩnh mịch. Khi đêm xuống, Contra có quầng sáng bảo hộ xung quanh mình!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide uppercase transition cursor-pointer"
        >
          ĐÃ HIỂU! CHIẾN THÔI
        </button>
      </div>
    </div>
  );
};
