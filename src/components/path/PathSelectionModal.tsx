import React from 'react';
import { TrackType } from '../../types';
import { sounds } from '../../utils/soundEffects';
import { Swords, Brain, Shield, Sparkles, Trophy, ChevronRight, Activity, ArrowLeft, X } from 'lucide-react';

interface PathSelectionProps {
  currentTrack: TrackType | null;
  onSelectTrack: (track: TrackType) => void;
  onClose?: () => void;
  canCancel?: boolean;
}

export const PathSelectionModal: React.FC<PathSelectionProps> = ({
  currentTrack,
  onSelectTrack,
  onClose,
  canCancel = false,
}) => {
  const handleSelect = (track: TrackType) => {
    sounds.playLevelUp();
    onSelectTrack(track);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl system-window rounded-2xl p-6 md:p-8 relative border border-cyan-500/50 my-auto">
        {/* Top Header Controls with Back/Close Button */}
        <div className="flex items-center justify-between mb-4">
          {onClose ? (
            <button
              onClick={() => { sounds.playStatAdd(); onClose(); }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold font-orbitron text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {onClose && (
            <button
              onClick={() => { sounds.playStatAdd(); onClose(); }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Top Glowing Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 text-xs font-rajdhani font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            [ THE SYSTEM PROPOSAL ]
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-orbitron text-white tracking-wider system-glow-text">
            CHOOSE YOUR ASCENSION PATHWAY
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-lg mx-auto font-rajdhani">
            The System presents two divergent paths to cultivate mana and transcend human rank limits. Select your primary evolution discipline:
          </p>
        </div>

        {/* 2 Tracks Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* 1. HUNTER TYPE */}
          <div
            onClick={() => handleSelect('HUNTER')}
            className={`group relative rounded-xl p-5 cursor-pointer transition-all duration-300 border ${
              currentTrack === 'HUNTER'
                ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400'
                : 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                <Swords className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-md bg-cyan-950/90 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                Physical Evolution
              </span>
            </div>

            <h3 className="text-xl font-bold font-orbitron text-white group-hover:text-cyan-300 transition flex items-center gap-2">
              HUNTER TYPE
            </h3>

            <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
              A 30-Day structured progressive physical regime: 100 Push-ups, 100 Sit-ups, 100 Squats, and 10km Run with daily penalty zone protection.
            </p>

            {/* Core Stats Boosted */}
            <div className="mt-4 pt-3 border-t border-cyan-950 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-cyan-400 font-bold border border-cyan-900">
                + STR (Strength)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-cyan-400 font-bold border border-cyan-900">
                + AGI (Agility)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-cyan-400 font-bold border border-cyan-900">
                + VIT (Vitality)
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Embark Physical Trial</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* 2. MAZE TYPE */}
          <div
            onClick={() => handleSelect('MAZE')}
            className={`group relative rounded-xl p-5 cursor-pointer transition-all duration-300 border ${
              currentTrack === 'MAZE'
                ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.35)] ring-2 ring-purple-400'
                : 'bg-slate-900/80 border-slate-700/80 hover:border-purple-500 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-md bg-purple-950/90 border border-purple-500/40 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                Cognitive Trials
              </span>
            </div>

            <h3 className="text-xl font-bold font-orbitron text-white group-hover:text-purple-300 transition flex items-center gap-2">
              MAZE TYPE
            </h3>

            <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
              Engage in tactical Chess warfare against System AI entities, Mate-in-1/2 trials, and runic memory logic puzzles to master mana manipulation.
            </p>

            {/* Core Stats Boosted */}
            <div className="mt-4 pt-3 border-t border-purple-950 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-purple-400 font-bold border border-purple-900">
                + INT (Intelligence)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-purple-400 font-bold border border-purple-900">
                + PER (Perception)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-purple-400 font-bold border border-purple-900">
                + MP Capacity
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Enter Maze Labyrinth</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            You can switch pathways anytime from your System Status Window.
          </span>
          {canCancel && onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
