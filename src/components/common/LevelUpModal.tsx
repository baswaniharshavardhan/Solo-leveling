import React from 'react';
import { sounds } from '../../utils/soundEffects';
import { Sparkles, Trophy, CheckCircle, Flame, Zap, Heart } from 'lucide-react';

interface LevelUpModalProps {
  newLevel: number;
  statPointsGained: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  newLevel,
  statPointsGained,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-md system-window rounded-2xl p-6 md:p-8 text-center relative border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.4)]">
        {/* Animated Corner Ornaments */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-cyan-300" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-cyan-300" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-cyan-300" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-cyan-300" />

        {/* System Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-orbitron font-bold tracking-widest uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
          SYSTEM ANNOUNCEMENT
        </div>

        <h2 className="text-3xl md:text-4xl font-black font-orbitron text-white tracking-widest system-glow-text mb-1">
          LEVEL UP!
        </h2>
        <div className="text-2xl font-black font-orbitron text-cyan-400 mb-4">
          LEVEL {newLevel} REACHED
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-2.5 text-xs font-rajdhani text-left mb-6">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>HP and MP fully restored to 100%.</span>
          </div>
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Fatigue level reset to 0.</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>+{statPointsGained} Attribute Points added to Status Window.</span>
          </div>
        </div>

        <button
          type="button"
          id="btn-level-up-confirm"
          onClick={() => { sounds.playStatAdd(); onClose(); }}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black font-orbitron text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(6,182,212,0.5)] transition active:scale-98"
        >
          CONFIRM & ALLOCATE ATTRIBUTES
        </button>
      </div>
    </div>
  );
};
