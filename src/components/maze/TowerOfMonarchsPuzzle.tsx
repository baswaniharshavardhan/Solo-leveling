import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Layers, RotateCcw, HelpCircle, Trophy, Sparkles, CheckCircle2, ArrowLeft, Shield } from 'lucide-react';

interface TowerOfMonarchsPuzzleProps {
  onRewardClaim: (xp: number, statBonuses: { int?: number; per?: number }) => void;
  onBack?: () => void;
}

type RingCount = 3 | 4;

export const TowerOfMonarchsPuzzle: React.FC<TowerOfMonarchsPuzzleProps> = ({
  onRewardClaim,
  onBack,
}) => {
  const [numDisks, setNumDisks] = useState<RingCount>(3);
  const [towers, setTowers] = useState<number[][]>([[], [], []]);
  const [selectedTower, setSelectedTower] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const initTowers = (count: RingCount) => {
    // Disks 1 (smallest) to count (largest)
    const initialTower = Array.from({ length: count }, (_, i) => count - i); // e.g. [3, 2, 1]
    setTowers([initialTower, [], []]);
    setSelectedTower(null);
    setMoves(0);
    setIsSolved(false);
    setShowHint(false);
  };

  useEffect(() => {
    initTowers(numDisks);
  }, [numDisks]);

  const handleTowerClick = (towerIndex: number) => {
    if (isSolved) return;

    // If no tower currently selected
    if (selectedTower === null) {
      if (towers[towerIndex].length === 0) return; // empty tower
      sounds.playStatAdd();
      setSelectedTower(towerIndex);
      return;
    }

    // If clicked the same tower, deselect
    if (selectedTower === towerIndex) {
      setSelectedTower(null);
      return;
    }

    // Attempt move from selectedTower to towerIndex
    const source = [...towers[selectedTower]];
    const target = [...towers[towerIndex]];

    const diskToMove = source[source.length - 1];
    const topOfTarget = target[target.length - 1];

    // Rule: cannot put larger disk on top of smaller disk
    if (topOfTarget !== undefined && topOfTarget < diskToMove) {
      sounds.playWarning();
      setSelectedTower(null);
      return;
    }

    // Valid move!
    sounds.playChessMove(false);
    source.pop();
    target.push(diskToMove);

    const nextTowers = towers.map((t, idx) => {
      if (idx === selectedTower) return source;
      if (idx === towerIndex) return target;
      return t;
    });

    setTowers(nextTowers);
    setSelectedTower(null);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    // Check if target tower 2 (Monarch Pillar) has all disks
    if (nextTowers[2].length === numDisks) {
      setIsSolved(true);
      sounds.playLevelUp();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      const intGain = numDisks === 3 ? 3 : 5;
      onRewardClaim(120 + (numDisks - 3) * 80, { int: intGain, per: 3 });
    }
  };

  const getDiskColor = (size: number) => {
    switch (size) {
      case 1: return 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]';
      case 2: return 'bg-purple-500 text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.8)]';
      case 3: return 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]';
      case 4: return 'bg-rose-500 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.8)]';
      default: return 'bg-slate-400 text-slate-950';
    }
  };

  const minMoves = Math.pow(2, numDisks) - 1;
  const towerNames = ['Shadow Altar', 'Mana Conduit', 'Monarch Altar'];

  return (
    <div className="system-window rounded-2xl p-5 md:p-6 border border-cyan-500/50">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={() => { sounds.playStatAdd(); onBack(); }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition flex items-center gap-1 text-xs font-bold font-orbitron"
              title="Back to All Puzzles"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-orbitron font-bold text-cyan-400 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              TOWER OF MONARCHS (HANOI TRIAL)
            </div>
            <h3 className="text-base font-bold text-white">
              Transfer All Mana Disks to Monarch Altar
            </h3>
          </div>
        </div>

        <button
          onClick={() => { sounds.playStatAdd(); initTowers(numDisks); }}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <p className="text-xs text-slate-300 mb-4 font-rajdhani">
        Tap a pillar to lift its top mana disk, then tap a destination pillar. A larger disk can never be placed on top of a smaller disk.
      </p>

      {/* Disk Count Selector */}
      <div className="flex gap-2 mb-5 max-w-xs">
        <button
          onClick={() => { setNumDisks(3); sounds.playStatAdd(); }}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-orbitron transition border ${
            numDisks === 3
              ? 'bg-cyan-950 text-cyan-300 border-cyan-400 font-black'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          3 Disks (Min: 7 moves)
        </button>
        <button
          onClick={() => { setNumDisks(4); sounds.playStatAdd(); }}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-orbitron transition border ${
            numDisks === 4
              ? 'bg-cyan-950 text-cyan-300 border-cyan-400 font-black'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          4 Disks (Min: 15 moves)
        </button>
      </div>

      {/* Towers Stage */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 mb-5 shadow-inner">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 h-48 sm:h-52">
          {towers.map((tower, tIdx) => {
            const isSource = selectedTower === tIdx;
            return (
              <div
                key={tIdx}
                onClick={() => handleTowerClick(tIdx)}
                className={`relative flex flex-col items-center justify-end p-2 rounded-xl cursor-pointer transition-all border ${
                  isSource
                    ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                }`}
              >
                {/* Vertical Spire Rod */}
                <div className="absolute bottom-4 top-4 w-2 bg-slate-700 rounded-full -z-0" />

                {/* Disks stacked bottom-up */}
                <div className="w-full flex flex-col-reverse items-center gap-1.5 z-10 mb-2">
                  {tower.map((size) => {
                    const widthPercent = 30 + (size / numDisks) * 65;
                    return (
                      <div
                        key={size}
                        style={{ width: `${widthPercent}%` }}
                        className={`h-6 sm:h-7 rounded-lg border flex items-center justify-center font-orbitron font-black text-xs transition-all duration-200 ${getDiskColor(
                          size
                        )}`}
                      >
                        Tier {size}
                      </div>
                    );
                  })}
                </div>

                {/* Base Plate */}
                <div className="w-full h-2.5 rounded bg-slate-800 border-t border-slate-700 z-10" />

                <span className="text-[10px] font-orbitron font-bold text-slate-400 mt-1.5 text-center">
                  {towerNames[tIdx]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-3 text-xs font-mono text-slate-400 px-2">
          <span>Moves: <strong className="text-cyan-300">{moves}</strong></span>
          <span>Optimal Target: <strong className="text-slate-300">{minMoves} moves</strong></span>
        </div>
      </div>

      {/* Solved Banner */}
      {isSolved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-rajdhani font-bold text-center mb-4 flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>MONARCH ALTAR CHARGED! Transferred in {moves} moves. +Intelligence & Perception Acquired.</span>
        </div>
      )}

      {/* Hint Drawer */}
      {showHint && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 mb-4 font-rajdhani">
          💡 <strong>System Hint:</strong> For odd numbers of disks, move the smallest disk to the destination pillar first. For even numbers, move the smallest disk to the spare pillar first.
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          onClick={() => { sounds.playStatAdd(); setShowHint(!showHint); }}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          {showHint ? 'Hide Hint' : 'Tactical Hint'}
        </button>

        {onBack && (
          <button
            onClick={() => { sounds.playStatAdd(); onBack(); }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Trials</span>
          </button>
        )}
      </div>
    </div>
  );
};
