import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Zap, RotateCcw, HelpCircle, Trophy, Sparkles, CheckCircle2, ArrowLeft, Layers } from 'lucide-react';

interface ManaCircuitPuzzleProps {
  onRewardClaim: (xp: number, statBonuses: { int?: number; per?: number }) => void;
  onBack?: () => void;
}

type CircuitDifficulty = 'E-Rank (3x3)' | 'C-Rank (4x4)' | 'S-Rank (5x5)';

export const ManaCircuitPuzzle: React.FC<ManaCircuitPuzzleProps> = ({
  onRewardClaim,
  onBack,
}) => {
  const [difficulty, setDifficulty] = useState<CircuitDifficulty>('E-Rank (3x3)');
  const [gridSize, setGridSize] = useState<number>(3);
  const [grid, setGrid] = useState<boolean[]>([]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Initialize and shuffle board
  const initCircuit = (size: number) => {
    setGridSize(size);
    setMoves(0);
    setIsSolved(false);
    setShowHint(false);

    // Start with all true, then apply random valid clicks to guarantee solvability
    const totalCells = size * size;
    const initialGrid = Array(totalCells).fill(true);

    const shuffleClicks = size === 3 ? 4 : size === 4 ? 7 : 11;
    for (let i = 0; i < shuffleClicks; i++) {
      const randIdx = Math.floor(Math.random() * totalCells);
      const r = Math.floor(randIdx / size);
      const c = randIdx % size;

      // Toggle cell and neighbors
      const neighbors = [
        [r, c],
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ];

      neighbors.forEach(([nr, nc]) => {
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const nIdx = nr * size + nc;
          initialGrid[nIdx] = !initialGrid[nIdx];
        }
      });
    }

    // Check if accidentally solved already, if so toggle center
    if (initialGrid.every((cell) => cell)) {
      initialGrid[0] = false;
      initialGrid[1] = !initialGrid[1];
      initialGrid[size] = !initialGrid[size];
    }

    setGrid(initialGrid);
  };

  useEffect(() => {
    const size = difficulty === 'E-Rank (3x3)' ? 3 : difficulty === 'C-Rank (4x4)' ? 4 : 5;
    initCircuit(size);
  }, [difficulty]);

  const handleCellClick = (index: number) => {
    if (isSolved) return;
    sounds.playStatAdd();
    setMoves((m) => m + 1);

    const r = Math.floor(index / gridSize);
    const c = index % gridSize;

    const nextGrid = [...grid];
    const neighbors = [
      [r, c],
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];

    neighbors.forEach(([nr, nc]) => {
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
        const nIdx = nr * gridSize + nc;
        nextGrid[nIdx] = !nextGrid[nIdx];
      }
    });

    setGrid(nextGrid);

    // Check if all are active
    if (nextGrid.every((cell) => cell)) {
      setIsSolved(true);
      sounds.playLevelUp();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      const intBonus = gridSize === 3 ? 2 : gridSize === 4 ? 3 : 5;
      const xpBonus = gridSize === 3 ? 60 : gridSize === 4 ? 120 : 200;
      onRewardClaim(xpBonus, { int: intBonus, per: 2 });
    }
  };

  const activeCount = grid.filter(Boolean).length;
  const totalCount = gridSize * gridSize;

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
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              MANA CIRCUIT MATRIX
            </div>
            <h3 className="text-base font-bold text-white">
              Activate All Runic Nodes ({activeCount}/{totalCount})
            </h3>
          </div>
        </div>

        <button
          onClick={() => { sounds.playStatAdd(); initCircuit(gridSize); }}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <p className="text-xs text-slate-300 mb-4 font-rajdhani">
        Tapping any node toggles its mana state and inverts its 4 adjacent neighbors (North, South, East, West). Harmonize the entire circuit to blue to unlock the ancient matrix.
      </p>

      {/* Difficulty Selectors */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {(['E-Rank (3x3)', 'C-Rank (4x4)', 'S-Rank (5x5)'] as CircuitDifficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => { sounds.playStatAdd(); setDifficulty(diff); }}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition border ${
              difficulty === diff
                ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-900/30 font-black'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Grid Canvas */}
      <div className="flex flex-col items-center justify-center mb-5">
        <div
          className="grid gap-2 p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            maxWidth: gridSize === 3 ? '220px' : gridSize === 4 ? '280px' : '330px',
            width: '100%',
          }}
        >
          {grid.map((isActive, idx) => (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              className={`aspect-square rounded-xl flex items-center justify-center font-black font-orbitron text-sm transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_18px_rgba(6,182,212,0.85)] border border-cyan-200'
                  : 'bg-slate-900/90 text-slate-600 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800'
              }`}
            >
              <Zap className={`w-5 h-5 ${isActive ? 'fill-slate-950 text-slate-950' : 'text-slate-700'}`} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs font-mono text-slate-400">
          <span>Moves: <strong className="text-cyan-300">{moves}</strong></span>
          <span>Active Nodes: <strong className="text-cyan-300">{activeCount} / {totalCount}</strong></span>
        </div>
      </div>

      {/* Solved Banner */}
      {isSolved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-rajdhani font-bold text-center mb-4 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>MANA HARMONIZATION COMPLETE! +{gridSize === 3 ? 2 : gridSize === 4 ? 3 : 5} INT, +2 PER & XP Gained.</span>
        </div>
      )}

      {/* Hint Banner */}
      {showHint && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 mb-4 font-rajdhani">
          💡 <strong>System Hint:</strong> Focus on activating corner nodes first, then toggle edge midpoints to cascade mana toward the center.
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
