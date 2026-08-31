import React from 'react';
import { TrackType } from '../../types';
import { sounds } from '../../utils/soundEffects';
import { Swords, Brain, UserCheck, Bell, Smartphone, Edit3 } from 'lucide-react';

interface BottomNavProps {
  currentTrack: TrackType | null;
  onSelectTrack: (track: TrackType) => void;
  onOpenStatus: () => void;
  onOpenMorningReminder: () => void;
  onOpenEditProfile: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTrack,
  onSelectTrack,
  onOpenStatus,
  onOpenMorningReminder,
  onOpenEditProfile,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  return (
    <nav className="sticky bottom-0 z-30 w-full bg-slate-950/95 backdrop-blur-lg border-t border-cyan-500/30 px-2 sm:px-4 py-2">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {/* 1. Hunter Track */}
        <button
          onClick={() => { sounds.playStatAdd(); onSelectTrack('HUNTER'); }}
          className={`py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center transition cursor-pointer ${
            currentTrack === 'HUNTER'
              ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Swords className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] sm:text-[10px] font-orbitron font-bold uppercase">Hunter</span>
        </button>

        {/* 2. Maze Track */}
        <button
          onClick={() => { sounds.playStatAdd(); onSelectTrack('MAZE'); }}
          className={`py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center transition cursor-pointer ${
            currentTrack === 'MAZE'
              ? 'bg-purple-950/90 text-purple-300 border border-purple-500/50 shadow-md shadow-purple-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] sm:text-[10px] font-orbitron font-bold uppercase">Maze</span>
        </button>

        {/* 3. Status Window */}
        <button
          onClick={() => { sounds.playStatAdd(); onOpenStatus(); }}
          className="py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition cursor-pointer"
        >
          <UserCheck className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] sm:text-[10px] font-orbitron font-bold uppercase">Status</span>
        </button>

        {/* 4. Morning Reminder */}
        <button
          onClick={() => { sounds.playStatAdd(); onOpenMorningReminder(); }}
          className="py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition cursor-pointer"
        >
          <Bell className="w-4 h-4 mb-0.5 text-cyan-400" />
          <span className="text-[9px] sm:text-[10px] font-orbitron font-bold uppercase">Alarm</span>
        </button>

        {/* 5. Frame Simulator Toggle */}
        <button
          onClick={() => { sounds.playStatAdd(); onToggleMobileFrame(); }}
          className={`py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center transition cursor-pointer ${
            isMobileFrame
              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] sm:text-[10px] font-orbitron font-bold uppercase">
            {isMobileFrame ? 'Phone UI' : 'Full UI'}
          </span>
        </button>
      </div>
    </nav>
  );
};
