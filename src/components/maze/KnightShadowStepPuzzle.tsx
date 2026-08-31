import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Swords, RotateCcw, HelpCircle, Trophy, Sparkles, CheckCircle2, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

interface KnightShadowStepPuzzleProps {
  onRewardClaim: (xp: number, statBonuses: { int?: number; per?: number }) => void;
  onBack?: () => void;
}

interface LevelData {
  name: string;
  gridSize: number;
  startPos: [number, number];
  portals: [number, number][];
  traps: [number, number][];
  difficulty: string;
}

const LEVELS: LevelData[] = [
  {
    name: 'Trial I: Awakening Step',
    gridSize: 5,
    startPos: [0, 0],
    portals: [[1, 2], [3, 3], [4, 1]],
    traps: [[2, 2]],
    difficulty: 'E-Rank',
  },
  {
    name: 'Trial II: Gate of Shadows',
    gridSize: 5,
    startPos: [0, 0],
    portals: [[2, 1], [4, 2], [3, 4], [1, 3]],
    traps: [[1, 1], [3, 2]],
    difficulty: 'C-Rank',
  },
  {
    name: 'Trial III: Monarch Labyrinth',
    gridSize: 5,
    startPos: [0, 2],
    portals: [[2, 1], [4, 0], [4, 4], [1, 4], [3, 3]],
    traps: [[1, 2], [2, 3], [3, 1]],
    difficulty: 'A-Rank',
  },
];

export const KnightShadowStepPuzzle: React.FC<KnightShadowStepPuzzleProps> = ({
  onRewardClaim,
  onBack,
}) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = LEVELS[levelIndex];

  const [currentPos, setCurrentPos] = useState<[number, number]>(currentLevel.startPos);
  const [visitedCells, setVisitedCells] = useState<string[]>([]);
  const [collectedPortals, setCollectedPortals] = useState<string[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Initialize level
  const initLevel = (lvl: LevelData) => {
    setCurrentPos(lvl.startPos);
    setVisitedCells([`${lvl.startPos[0]},${lvl.startPos[1]}`]);
    setCollectedPortals([]);
    setMovesCount(0);
    setIsGameOver(false);
    setIsSolved(false);
    setShowHint(false);
  };

  useEffect(() => {
    initLevel(currentLevel);
  }, [levelIndex]);

  // Calculate valid Knight moves from current pos
  const getValidKnightMoves = (r: number, c: number, size: number) => {
    const deltas = [
      [-2, -1], [-2, 1],
      [-1, -2], [-1, 2],
      [1, -2],  [1, 2],
      [2, -1],  [2, 1],
    ];

    return deltas
      .map(([dr, dc]) => [r + dr, c + dc] as [number, number])
      .filter(([nr, nc]) => nr >= 0 && nr < size && nc >= 0 && nc < size);
  };

  const validMoves = getValidKnightMoves(currentPos[0], currentPos[1], currentLevel.gridSize);

  const handleTileClick = (r: number, c: number) => {
    if (isSolved || isGameOver) return;

    // Check if it's a valid Knight move
    const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
    if (!isValid) {
      sounds.playWarning();
      return;
    }

    const key = `${r},${c}`;

    // Check trap
    const isTrap = currentLevel.traps.some(([tr, tc]) => tr === r && tc === c);
    if (isTrap) {
      sounds.playWarning();
      setIsGameOver(true);
      return;
    }

    // Check if visited before
    if (visitedCells.includes(key)) {
      sounds.playWarning();
      return;
    }

    sounds.playChessMove(false);
    setCurrentPos([r, c]);
    const nextVisited = [...visitedCells, key];
    setVisitedCells(nextVisited);
    setMovesCount((m) => m + 1);

    // Check if portal collected
    const isPortal = currentLevel.portals.some(([pr, pc]) => pr === r && pc === c);
    let nextPortals = collectedPortals;
    if (isPortal && !collectedPortals.includes(key)) {
      sounds.playStatAdd();
      nextPortals = [...collectedPortals, key];
      setCollectedPortals(nextPortals);
    }

    // Check if all portals collected
    if (nextPortals.length === currentLevel.portals.length) {
      setIsSolved(true);
      sounds.playLevelUp();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      const intGain = levelIndex === 0 ? 2 : levelIndex === 1 ? 3 : 5;
      onRewardClaim(100 + levelIndex * 50, { int: intGain, per: 3 });
    }
  };

  return (
    <div className="system-window-purple rounded-2xl p-5 md:p-6 border border-purple-500/50">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/30 mb-4">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={() => { sounds.playStatAdd(); onBack(); }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-purple-300 transition flex items-center gap-1 text-xs font-bold font-orbitron"
              title="Back to All Puzzles"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-orbitron font-bold text-purple-300 uppercase tracking-wider">
              <Swords className="w-3.5 h-3.5 text-purple-400" />
              KNIGHT'S SHADOW STEP ({currentLevel.difficulty})
            </div>
            <h3 className="text-base font-bold text-white">
              {currentLevel.name}
            </h3>
          </div>
        </div>

        <button
          onClick={() => { sounds.playStatAdd(); initLevel(currentLevel); }}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-400 text-xs font-bold text-slate-300 hover:text-purple-300 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Retry</span>
        </button>
      </div>

      <p className="text-xs text-slate-300 mb-4 font-rajdhani">
        Move your Shadow Knight across the dungeon tiles using standard chess Knight "L-steps". Collect all mana portal orbs without stepping on shadow traps or visited tiles.
      </p>

      {/* Level Selector */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {LEVELS.map((lvl, idx) => (
          <button
            key={lvl.name}
            onClick={() => { setLevelIndex(idx); sounds.playStatAdd(); }}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition border ${
              levelIndex === idx
                ? 'bg-purple-950 text-purple-300 border-purple-400 shadow-md shadow-purple-900/30 font-black'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {lvl.difficulty}
          </button>
        ))}
      </div>

      {/* 5x5 Dungeon Grid */}
      <div className="flex flex-col items-center justify-center mb-5">
        <div
          className="grid grid-cols-5 gap-1.5 p-3 rounded-2xl bg-slate-950 border border-purple-500/40 shadow-inner"
          style={{ maxWidth: '300px', width: '100%' }}
        >
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 5 }).map((_, c) => {
              const key = `${r},${c}`;
              const isCurrent = currentPos[0] === r && currentPos[1] === c;
              const isVisited = visitedCells.includes(key) && !isCurrent;
              const isPortal = currentLevel.portals.some(([pr, pc]) => pr === r && pc === c);
              const isPortalDone = collectedPortals.includes(key);
              const isTrap = currentLevel.traps.some(([tr, tc]) => tr === r && tc === c);
              const isMoveTarget = validMoves.some(([vr, vc]) => vr === r && vc === c) && !isVisited;

              return (
                <button
                  key={key}
                  disabled={isCurrent || isVisited || isSolved || isGameOver}
                  onClick={() => handleTileClick(r, c)}
                  className={`aspect-square rounded-xl relative flex items-center justify-center font-bold text-xs transition-all duration-150 ${
                    isCurrent
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.8)] border-2 border-purple-200 z-10'
                      : isPortal && !isPortalDone
                      ? 'bg-amber-950/80 border-2 border-amber-400 text-amber-300 animate-pulse'
                      : isPortalDone
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 opacity-60'
                      : isTrap
                      ? 'bg-red-950/50 border border-red-500/40 text-red-400'
                      : isVisited
                      ? 'bg-slate-950 border border-slate-800 text-slate-700 cursor-not-allowed'
                      : isMoveTarget
                      ? 'bg-purple-950/60 border-2 border-dashed border-purple-400/80 text-purple-200 hover:bg-purple-900/80 shadow-md shadow-purple-950/40'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-500'
                  }`}
                >
                  {isCurrent ? (
                    <span className="text-base font-black">♞</span>
                  ) : isPortal && !isPortalDone ? (
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  ) : isTrap ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  ) : isMoveTarget ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                  ) : isVisited ? (
                    <span className="text-[9px] text-slate-700">✕</span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs font-mono text-slate-400">
          <span>Portals: <strong className="text-amber-300">{collectedPortals.length} / {currentLevel.portals.length}</strong></span>
          <span>Moves Taken: <strong className="text-purple-300">{movesCount}</strong></span>
        </div>
      </div>

      {/* Outcome Banners */}
      {isSolved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-rajdhani font-bold text-center mb-4 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>SHADOW STEP MASTERED! All Mana Portals Activated.</span>
        </div>
      )}

      {isGameOver && (
        <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500/50 text-red-300 text-xs font-rajdhani font-bold text-center mb-4">
          ⚠️ TRAP TRIGGERED! The Shadow Knight fell into the abyss. Tap Retry to attempt again.
        </div>
      )}

      {/* Hint Drawer */}
      {showHint && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 mb-4 font-rajdhani">
          💡 <strong>System Hint:</strong> Plan 2 moves ahead. Purple glowing dots show valid L-shaped Knight landing points.
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
