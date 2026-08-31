import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessPuzzle, LogicPuzzleType, UserProfile } from '../../types';
import { DEFAULT_CHESS_PUZZLES } from '../../utils/storage';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  Brain, Swords, Trophy, Sparkles, RefreshCw, HelpCircle, 
  CheckCircle, Play, Flame, Shield, ArrowRight, ArrowLeft, Lightbulb, Zap, Shuffle,
  Layers, KeyRound, Lock, Eye, Grid3X3
} from 'lucide-react';
import { ManaCircuitPuzzle } from './ManaCircuitPuzzle';
import { KnightShadowStepPuzzle } from './KnightShadowStepPuzzle';
import { RunicCipherPuzzle } from './RunicCipherPuzzle';
import { TowerOfMonarchsPuzzle } from './TowerOfMonarchsPuzzle';

interface MazeTrackViewProps {
  profile: UserProfile;
  completedPuzzles: string[];
  onCompletePuzzle: (puzzleId: string, intGain: number, xpGain: number) => void;
  onRewardClaim: (xp: number, statBonuses: { int?: number; per?: number }) => void;
  onSwitchTrack?: () => void;
}

export const MazeTrackView: React.FC<MazeTrackViewProps> = ({
  profile,
  completedPuzzles,
  onCompletePuzzle,
  onRewardClaim,
  onSwitchTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'CHESS_AI' | 'CHESS_PUZZLES' | 'LOGIC_GAMES'>('CHESS_PUZZLES');

  // -------------------------------------------------------------
  // 1. CHESS ENGINE STATE (chess.js)
  // -------------------------------------------------------------
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [aiDifficulty, setAiDifficulty] = useState<'E-Rank Goblin' | 'B-Rank Iron Golem' | 'S-Rank Shadow Igris'>('E-Rank Goblin');
  const [gameStatus, setGameStatus] = useState<string>('Your turn (White)');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Puzzle Mode State
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [puzzleStatus, setPuzzleStatus] = useState<'IDLE' | 'SOLVED' | 'FAILED'>('IDLE');
  const [showPuzzleHint, setShowPuzzleHint] = useState(false);
  const activePuzzle: ChessPuzzle = DEFAULT_CHESS_PUZZLES[currentPuzzleIndex] || DEFAULT_CHESS_PUZZLES[0];

  // -------------------------------------------------------------
  // 2. LOGIC PUZZLE SUITE STATE
  // -------------------------------------------------------------
  const [selectedLogicGame, setSelectedLogicGame] = useState<LogicPuzzleType | null>(null);

  // Memory Runes (Simon)
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [playerInputIndex, setPlayerInputIndex] = useState<number>(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeRuneGlow, setActiveRuneGlow] = useState<number | null>(null);
  const [memoryScore, setMemoryScore] = useState(0);

  // Sliding Glyph (3x3 puzzle)
  const [slidingGrid, setSlidingGrid] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 0, 8]); // 0 is empty
  const [slidingMoves, setSlidingMoves] = useState(0);
  const [slidingSolved, setSlidingSolved] = useState(false);

  // Load Puzzle FEN when switching puzzles
  useEffect(() => {
    if (activeTab === 'CHESS_PUZZLES' && activePuzzle) {
      try {
        chess.load(activePuzzle.fen);
        setFen(chess.fen());
        setSelectedSquare(null);
        setValidMoves([]);
        setPuzzleStatus(completedPuzzles.includes(activePuzzle.id) ? 'SOLVED' : 'IDLE');
        setShowPuzzleHint(false);
        setGameStatus(`Find the winning tactic for White!`);
      } catch {
        // ignore
      }
    }
  }, [activeTab, currentPuzzleIndex, completedPuzzles, activePuzzle, chess]);

  // -------------------------------------------------------------
  // CHESS INTERACTION LOGIC
  // -------------------------------------------------------------
  const handleSquareClick = (sq: Square) => {
    if (isAiThinking || puzzleStatus === 'SOLVED') return;

    if (!selectedSquare) {
      const piece = chess.get(sq);
      if (piece && piece.color === (activeTab === 'CHESS_PUZZLES' ? activePuzzle.turn : 'w')) {
        setSelectedSquare(sq);
        const moves = chess.moves({ square: sq, verbose: true }).map((m) => m.to);
        setValidMoves(moves);
        sounds.playStatAdd();
      }
      return;
    }

    // Try moving from selectedSquare to sq
    try {
      const move = chess.move({
        from: selectedSquare,
        to: sq,
        promotion: 'q',
      });

      if (move) {
        sounds.playChessMove(!!move.captured);
        setFen(chess.fen());
        setSelectedSquare(null);
        setValidMoves([]);

        // Handle Puzzle validation
        if (activeTab === 'CHESS_PUZZLES') {
          const moveSan = move.san;
          const moveLan = move.from + move.to;
          const isCorrect = activePuzzle.solutionMoves.some(
            (sol) => sol === moveSan || sol === moveLan || moveSan.includes(sol)
          );

          if (isCorrect || chess.isCheckmate()) {
            setPuzzleStatus('SOLVED');
            setGameStatus('TACTIC COMPLETE! +Intelligence & Perception gained.');
            sounds.playQuestComplete();
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
            onCompletePuzzle(activePuzzle.id, activePuzzle.intReward, activePuzzle.xpReward);
          } else {
            setPuzzleStatus('FAILED');
            setGameStatus('Inaccurate move. Resetting position...');
            sounds.playWarning();
            setTimeout(() => {
              chess.load(activePuzzle.fen);
              setFen(chess.fen());
              setPuzzleStatus('IDLE');
              setGameStatus('Try another tactical continuation!');
            }, 1200);
          }
          return;
        }

        // Handle AI Match Move
        if (activeTab === 'CHESS_AI') {
          if (chess.isGameOver()) {
            handleChessGameOver();
            return;
          }

          setGameStatus('Monarch AI is calculating mana flow...');
          setIsAiThinking(true);

          setTimeout(() => {
            makeAiMove();
          }, 600);
        }
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } catch {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const handleChessGameOver = () => {
    if (chess.isCheckmate()) {
      if (chess.turn() === 'b') {
        setGameStatus('VICTORY! You checkmated the Monarch AI!');
        sounds.playLevelUp();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
        onRewardClaim(150, { int: 3, per: 2 });
      } else {
        setGameStatus('DEFEAT! Monarch AI achieved checkmate.');
        sounds.playWarning();
      }
    } else if (chess.isDraw()) {
      setGameStatus('STALEMATE! The mana field reached perfect equilibrium.');
    }
  };

  const makeAiMove = () => {
    const possibleMoves = chess.moves({ verbose: true });
    if (possibleMoves.length === 0) {
      setIsAiThinking(false);
      handleChessGameOver();
      return;
    }

    let chosenMove = possibleMoves[0];

    if (aiDifficulty === 'E-Rank Goblin') {
      // Random move with priority on captures
      const captures = possibleMoves.filter((m) => m.captured);
      chosenMove = captures.length > 0 && Math.random() > 0.4
        ? captures[Math.floor(Math.random() * captures.length)]
        : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else if (aiDifficulty === 'B-Rank Iron Golem') {
      // Prioritize checks and captures
      const checksAndCaptures = possibleMoves.filter((m) => m.san.includes('+') || m.captured);
      chosenMove = checksAndCaptures.length > 0
        ? checksAndCaptures[Math.floor(Math.random() * checksAndCaptures.length)]
        : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else {
      // S-Rank Igris (High tactical heuristic)
      const captures = possibleMoves.filter((m) => m.captured);
      const checks = possibleMoves.filter((m) => m.san.includes('+'));
      if (checks.length > 0 && Math.random() > 0.3) {
        chosenMove = checks[0];
      } else if (captures.length > 0) {
        chosenMove = captures[0];
      } else {
        chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      }
    }

    chess.move(chosenMove);
    sounds.playChessMove(!!chosenMove.captured);
    setFen(chess.fen());
    setIsAiThinking(false);

    if (chess.isGameOver()) {
      handleChessGameOver();
    } else {
      setGameStatus(chess.inCheck() ? 'CHECK! Defend your King!' : 'Your turn (White)');
    }
  };

  const handleResetChessMatch = () => {
    sounds.playStatAdd();
    chess.reset();
    setFen(chess.fen());
    setSelectedSquare(null);
    setValidMoves([]);
    setGameStatus('New match started. Your turn (White)');
    setIsAiThinking(false);
  };

  // -------------------------------------------------------------
  // RUNIC MEMORY (SIMON) LOGIC
  // -------------------------------------------------------------
  const startMemoryGame = () => {
    sounds.playLevelUp();
    const firstSeq = [Math.floor(Math.random() * 4)];
    setMemorySequence(firstSeq);
    setPlayerInputIndex(0);
    setMemoryScore(0);
    playSequence(firstSeq);
  };

  const playSequence = (seq: number[]) => {
    setIsShowingSequence(true);
    let step = 0;

    const interval = setInterval(() => {
      if (step >= seq.length) {
        clearInterval(interval);
        setActiveRuneGlow(null);
        setIsShowingSequence(false);
        return;
      }

      const rune = seq[step];
      setActiveRuneGlow(rune);
      sounds.playStatAdd();

      setTimeout(() => {
        setActiveRuneGlow(null);
      }, 400);

      step++;
    }, 700);
  };

  const handleRuneClick = (runeIndex: number) => {
    if (isShowingSequence || memorySequence.length === 0) return;

    sounds.playStatAdd();
    setActiveRuneGlow(runeIndex);
    setTimeout(() => setActiveRuneGlow(null), 200);

    if (memorySequence[playerInputIndex] === runeIndex) {
      // Correct click
      const nextIndex = playerInputIndex + 1;
      if (nextIndex === memorySequence.length) {
        // Sequence completed
        const nextScore = memoryScore + 1;
        setMemoryScore(nextScore);
        sounds.playQuestComplete();
        onRewardClaim(40, { int: 1, per: 1 });

        // Add next rune
        const nextSeq = [...memorySequence, Math.floor(Math.random() * 4)];
        setMemorySequence(nextSeq);
        setPlayerInputIndex(0);

        setTimeout(() => {
          playSequence(nextSeq);
        }, 900);
      } else {
        setPlayerInputIndex(nextIndex);
      }
    } else {
      // Failed sequence
      sounds.playWarning();
      setMemorySequence([]);
      setPlayerInputIndex(0);
    }
  };

  // -------------------------------------------------------------
  // SLIDING GLYPH LOGIC
  // -------------------------------------------------------------
  const handleShuffleSliding = () => {
    sounds.playStatAdd();
    const solved = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let current = [...solved];
    let emptyIdx = 8;

    for (let i = 0; i < 30; i++) {
      const neighbors: number[] = [];
      const r = Math.floor(emptyIdx / 3);
      const c = emptyIdx % 3;

      if (r > 0) neighbors.push((r - 1) * 3 + c);
      if (r < 2) neighbors.push((r + 1) * 3 + c);
      if (c > 0) neighbors.push(r * 3 + (c - 1));
      if (c < 2) neighbors.push(r * 3 + (c + 1));

      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      current[emptyIdx] = current[pick];
      current[pick] = 0;
      emptyIdx = pick;
    }

    setSlidingGrid(current);
    setSlidingMoves(0);
    setSlidingSolved(false);
  };

  const handleSlideTile = (index: number) => {
    if (slidingSolved) return;
    const emptyIdx = slidingGrid.indexOf(0);
    const r1 = Math.floor(index / 3);
    const c1 = index % 3;
    const r2 = Math.floor(emptyIdx / 3);
    const c2 = emptyIdx % 3;

    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (isAdjacent) {
      sounds.playStatAdd();
      const next = [...slidingGrid];
      next[emptyIdx] = next[index];
      next[index] = 0;
      setSlidingGrid(next);
      const nextMoves = slidingMoves + 1;
      setSlidingMoves(nextMoves);

      // Check win condition [1,2,3,4,5,6,7,8,0]
      const isWin = next.every((val, idx) => (idx === 8 ? val === 0 : val === idx + 1));
      if (isWin) {
        setSlidingSolved(true);
        sounds.playLevelUp();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        onRewardClaim(100, { int: 2, per: 2 });
      }
    } else {
      sounds.playWarning();
    }
  };

  // Helper to render chess board pieces
  const renderBoardSquares = () => {
    const board = chess.board();
    const squares: React.ReactNode[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const file = String.fromCharCode(97 + c);
        const rank = 8 - r;
        const sq = `${file}${rank}` as Square;
        const isDark = (r + c) % 2 === 1;
        const piece = board[r][c];
        const isSelected = selectedSquare === sq;
        const isValidMove = validMoves.includes(sq);

        squares.push(
          <div
            key={sq}
            onClick={() => handleSquareClick(sq)}
            className={`w-full aspect-square flex items-center justify-center relative cursor-pointer select-none transition-colors duration-150 ${
              isSelected
                ? 'bg-cyan-500/80 ring-2 ring-cyan-300'
                : isDark
                ? 'bg-slate-900'
                : 'bg-slate-800'
            }`}
          >
            {/* Square Notation Labels on corners */}
            {c === 0 && (
              <span className="absolute top-0.5 left-1 text-[8px] font-mono text-slate-500 pointer-events-none">
                {rank}
              </span>
            )}
            {r === 7 && (
              <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-slate-500 pointer-events-none">
                {file}
              </span>
            )}

            {/* Valid Move Indicator Dot / Ring */}
            {isValidMove && (
              <div
                className={`absolute rounded-full z-10 ${
                  piece
                    ? 'w-full h-full border-2 border-cyan-400 bg-cyan-400/20'
                    : 'w-3 h-3 bg-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                }`}
              />
            )}

            {/* Chess Piece Symbol */}
            {piece && (
              <span
                className={`text-2xl sm:text-3xl font-black select-none z-10 transition-transform ${
                  piece.color === 'w'
                    ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]'
                    : 'text-purple-300 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]'
                }`}
              >
                {getPieceSymbol(piece.type, piece.color)}
              </span>
            )}
          </div>
        );
      }
    }

    return squares;
  };

  const getPieceSymbol = (type: string, color: 'w' | 'b') => {
    const symbols: Record<string, string> = {
      p: '♟',
      r: '♜',
      n: '♞',
      b: '♝',
      q: '♛',
      k: '♚',
    };
    return symbols[type] || '';
  };

  return (
    <div className="w-full space-y-5">
      {/* Top Navigation Bar with Back Button to Switch Pathway */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2">
          {onSwitchTrack && (
            <button
              onClick={() => { sounds.playStatAdd(); onSwitchTrack(); }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold font-orbitron text-slate-300 hover:text-white transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title="Return to Pathway Awakening"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
              <span>Pathways</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs font-orbitron font-bold text-purple-300">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">MAZE COGNITIVE LABYRINTH</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-cyan-400">
          Intellect: <strong className="text-white">{profile.stats.intelligence} INT</strong> | Percep: <strong className="text-white">{profile.stats.perception} PER</strong>
        </div>
      </div>

      {/* Primary Category Selector */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
        <button
          onClick={() => { setActiveTab('CHESS_PUZZLES'); setSelectedLogicGame(null); sounds.playStatAdd(); }}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold font-orbitron transition flex items-center justify-center gap-1.5 ${
            activeTab === 'CHESS_PUZZLES'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Tactics Trials</span>
        </button>

        <button
          onClick={() => { setActiveTab('CHESS_AI'); setSelectedLogicGame(null); sounds.playStatAdd(); }}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold font-orbitron transition flex items-center justify-center gap-1.5 ${
            activeTab === 'CHESS_AI'
              ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-900/40 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>VS Monarch AI</span>
        </button>

        <button
          onClick={() => { setActiveTab('LOGIC_GAMES'); sounds.playStatAdd(); }}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold font-orbitron transition flex items-center justify-center gap-1.5 ${
            activeTab === 'LOGIC_GAMES'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Runic Logic (6)</span>
        </button>
      </div>

      {/* ---------------- CHESS PUZZLES / TACTICS VIEW ---------------- */}
      {activeTab === 'CHESS_PUZZLES' && (
        <div className="system-window-purple rounded-2xl p-5 md:p-6 border border-purple-500/50">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/30 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-orbitron font-bold text-purple-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                TACTICAL CHESS TRIAL #{currentPuzzleIndex + 1}
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {activePuzzle.title}
              </h3>
            </div>

            <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-400/40 text-xs font-bold text-purple-300">
              {activePuzzle.difficulty}
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-4 font-rajdhani">
            {activePuzzle.description}
          </p>

          {/* Interactive Chessboard Container */}
          <div className="max-w-xs sm:max-w-sm mx-auto mb-4 p-2 rounded-xl bg-slate-950 border border-purple-500/40 shadow-inner">
            <div className="grid grid-cols-8 grid-rows-8 border border-slate-700 rounded-lg overflow-hidden">
              {renderBoardSquares()}
            </div>
          </div>

          {/* Game Status Banner */}
          <div className={`p-3 rounded-xl text-xs font-rajdhani text-center font-bold mb-4 ${
            puzzleStatus === 'SOLVED'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
              : puzzleStatus === 'FAILED'
              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
              : 'bg-slate-900 text-cyan-300 border border-slate-700'
          }`}>
            {gameStatus}
          </div>

          {/* Hint Drawer */}
          {showPuzzleHint && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 mb-4 font-rajdhani">
              💡 <strong>System Hint:</strong> {activePuzzle.hint}
            </div>
          )}

          {/* Controls with Back / Nav buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => { setShowPuzzleHint(!showPuzzleHint); sounds.playStatAdd(); }}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              {showPuzzleHint ? 'Hide Hint' : 'Runic Hint'}
            </button>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPuzzleIndex <= 0}
                onClick={() => { setCurrentPuzzleIndex((p) => p - 1); sounds.playStatAdd(); }}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-slate-300 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                disabled={currentPuzzleIndex >= DEFAULT_CHESS_PUZZLES.length - 1}
                onClick={() => { setCurrentPuzzleIndex((p) => p + 1); sounds.playStatAdd(); }}
                className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-white transition flex items-center gap-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CHESS AI BATTLE VIEW ---------------- */}
      {activeTab === 'CHESS_AI' && (
        <div className="system-window rounded-2xl p-5 md:p-6 border border-cyan-500/50">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
            <div>
              <div className="text-[11px] font-orbitron font-bold text-cyan-400 uppercase tracking-wider">
                CHESS WARFARE: COMBAT ARENA
              </div>
              <h3 className="text-base font-bold text-white">
                Opponent: <span className="text-cyan-300">{aiDifficulty}</span>
              </h3>
            </div>

            <button
              onClick={handleResetChessMatch}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Board
            </button>
          </div>

          {/* AI Difficulty Selector */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['E-Rank Goblin', 'B-Rank Iron Golem', 'S-Rank Shadow Igris'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => { setAiDifficulty(diff); sounds.playStatAdd(); }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition border ${
                  aiDifficulty === diff
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-900/30 font-black'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {diff.split(' ')[0]} {diff.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Interactive Chessboard Container */}
          <div className="max-w-xs sm:max-w-sm mx-auto mb-4 p-2 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-inner">
            <div className="grid grid-cols-8 grid-rows-8 border border-slate-700 rounded-lg overflow-hidden">
              {renderBoardSquares()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-center text-xs font-rajdhani font-bold text-cyan-300">
            {gameStatus}
          </div>
        </div>
      )}

      {/* ---------------- LOGIC GAMES SUITE ---------------- */}
      {activeTab === 'LOGIC_GAMES' && (
        <div className="space-y-4">
          {/* If no specific logic game selected, show the Cognitive Trials Game Selection Gallery */}
          {selectedLogicGame === null ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <h3 className="text-base font-black font-orbitron text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  COGNITIVE TRIAL LABYRINTH
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-rajdhani">
                  Select an ancient mana trial to train your cognitive faculties, sharpen perception, and gather intelligence attributes:
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Mana Circuit Matrix */}
                <div
                  onClick={() => { setSelectedLogicGame('MANA_CIRCUIT'); sounds.playStatAdd(); }}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition group shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      3x3 to 5x5
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-orbitron group-hover:text-cyan-300 transition">
                    Mana Circuit Matrix
                  </h4>
                  <p className="text-xs text-slate-400 font-rajdhani mt-1">
                    Toggle mana nodes and neighbor harmonics to illuminate the ancient rune matrix.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                    <span>Enter Trial</span> <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 2. Knight's Shadow Step */}
                <div
                  onClick={() => { setSelectedLogicGame('KNIGHT_MAZE'); sounds.playStatAdd(); }}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-400 cursor-pointer transition group shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Swords className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                      Chess Maze
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-orbitron group-hover:text-purple-300 transition">
                    Knight's Shadow Step
                  </h4>
                  <p className="text-xs text-slate-400 font-rajdhani mt-1">
                    Execute L-shaped shadow steps across dungeon tiles to unlock portals and avoid traps.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-purple-400 flex items-center gap-1">
                    <span>Enter Trial</span> <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 3. Runic Decryption Cipher */}
                <div
                  onClick={() => { setSelectedLogicGame('RUNIC_CIPHER'); sounds.playStatAdd(); }}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition group shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                      Cipher Decrypt
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-orbitron group-hover:text-amber-300 transition">
                    Runic Decryption Cipher
                  </h4>
                  <p className="text-xs text-slate-400 font-rajdhani mt-1">
                    Decode ancient Monarch encrypted words and runic messages with letters & clues.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <span>Enter Trial</span> <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 4. Tower of Monarchs */}
                <div
                  onClick={() => { setSelectedLogicGame('TOWER_OF_MONARCHS'); sounds.playStatAdd(); }}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition group shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      Hanoi Stacking
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-orbitron group-hover:text-emerald-300 transition">
                    Tower of Monarchs
                  </h4>
                  <p className="text-xs text-slate-400 font-rajdhani mt-1">
                    Transfer tiered mana rings between shadow altars adhering to sovereign laws.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <span>Enter Trial</span> <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 5. Runic Memory Pulse */}
                <div
                  onClick={() => { setSelectedLogicGame('MEMORY_RUNES'); sounds.playStatAdd(); }}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-400 cursor-pointer transition group shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                      Simon Pulse
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-orbitron group-hover:text-indigo-300 transition">
                    Runic Memory Chamber
                  </h4>
                  <p className="text-xs text-slate-400 font-rajdhani mt-1">
                    Memorize and reproduce resonant mana pulses in escalating sequence lengths.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                    <span>Enter Trial</span> <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 6. Sliding Glyph */}
                <div
                  onClick={() => { setSelectedLogicGame('SLIDING_GLYPH'); sounds.playStatAdd(); }}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-400 cursor-pointer transition group shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <Grid3X3 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
                      3x3 Sliding
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-orbitron group-hover:text-blue-300 transition">
                    Shadow Gate Sliding Glyph
                  </h4>
                  <p className="text-xs text-slate-400 font-rajdhani mt-1">
                    Slide numerical glyph blocks (1 to 8) to rearrange the dungeon security seal.
                  </p>
                  <div className="mt-3 text-[11px] font-bold text-blue-400 flex items-center gap-1">
                    <span>Enter Trial</span> <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Back to All Logic Games button bar */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => { setSelectedLogicGame(null); sounds.playStatAdd(); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  <span>← Back to All Maze Games</span>
                </button>

                <span className="text-xs font-orbitron font-bold text-slate-400">
                  Current Game: <strong className="text-white">{selectedLogicGame.replace('_', ' ')}</strong>
                </span>
              </div>

              {/* Game View Switcher */}
              {selectedLogicGame === 'MANA_CIRCUIT' && (
                <ManaCircuitPuzzle
                  onRewardClaim={onRewardClaim}
                  onBack={() => setSelectedLogicGame(null)}
                />
              )}

              {selectedLogicGame === 'KNIGHT_MAZE' && (
                <KnightShadowStepPuzzle
                  onRewardClaim={onRewardClaim}
                  onBack={() => setSelectedLogicGame(null)}
                />
              )}

              {selectedLogicGame === 'RUNIC_CIPHER' && (
                <RunicCipherPuzzle
                  onRewardClaim={onRewardClaim}
                  onBack={() => setSelectedLogicGame(null)}
                />
              )}

              {selectedLogicGame === 'TOWER_OF_MONARCHS' && (
                <TowerOfMonarchsPuzzle
                  onRewardClaim={onRewardClaim}
                  onBack={() => setSelectedLogicGame(null)}
                />
              )}

              {/* Runic Memory Game */}
              {selectedLogicGame === 'MEMORY_RUNES' && (
                <div className="system-window-purple rounded-2xl p-6 border border-purple-500/50 text-center">
                  <div className="flex items-center justify-between pb-3 border-b border-purple-500/30 mb-4 text-left">
                    <button
                      onClick={() => { sounds.playStatAdd(); setSelectedLogicGame(null); }}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-purple-300 transition flex items-center gap-1 text-xs font-bold font-orbitron cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Back</span>
                    </button>

                    <div>
                      <span className="text-xs font-orbitron font-bold text-purple-400 uppercase">
                        RUNIC MEMORY CHAMBER
                      </span>
                      <h3 className="text-sm font-bold text-white">
                        Streak: <span className="text-purple-300 font-mono">{memoryScore}</span> Cycles
                      </h3>
                    </div>

                    <button
                      onClick={startMemoryGame}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-400 text-xs font-bold text-slate-300 hover:text-purple-300 flex items-center gap-1 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Restart</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-rajdhani mb-5">
                    Memorize the mana pulse sequence and tap the corresponding colored runes in exact order.
                  </p>

                  {/* 4 Rune Orbs */}
                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
                    {[0, 1, 2, 3].map((runeIdx) => {
                      const colors = [
                        'border-cyan-400 hover:bg-cyan-950/60 text-cyan-300',
                        'border-purple-400 hover:bg-purple-950/60 text-purple-300',
                        'border-emerald-400 hover:bg-emerald-950/60 text-emerald-300',
                        'border-rose-400 hover:bg-rose-950/60 text-rose-300',
                      ];
                      const activeGlows = [
                        'bg-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.9)] scale-105',
                        'bg-purple-400 text-slate-950 shadow-[0_0_25px_rgba(168,85,247,0.9)] scale-105',
                        'bg-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(52,211,153,0.9)] scale-105',
                        'bg-rose-400 text-slate-950 shadow-[0_0_25px_rgba(244,63,94,0.9)] scale-105',
                      ];

                      const isActive = activeRuneGlow === runeIdx;

                      return (
                        <button
                          key={runeIdx}
                          disabled={isShowingSequence || memorySequence.length === 0}
                          onClick={() => handleRuneClick(runeIdx)}
                          className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center font-orbitron font-black text-lg transition-all duration-150 ${
                            isActive ? activeGlows[runeIdx] : colors[runeIdx]
                          } bg-slate-900/90 disabled:opacity-75`}
                        >
                          <Sparkles className="w-5 h-5 mb-1" />
                          RUNE {runeIdx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {memorySequence.length === 0 ? (
                    <button
                      onClick={startMemoryGame}
                      className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold font-orbitron text-xs tracking-wider uppercase transition shadow-lg shadow-purple-900/50"
                    >
                      START RUNIC TRIAL
                    </button>
                  ) : (
                    <div className="text-xs font-mono text-purple-300">
                      {isShowingSequence ? 'Observing Mana Wave...' : 'Your Turn! Echo the Pulse.'}
                    </div>
                  )}
                </div>
              )}

              {/* Sliding Glyph Game */}
              {selectedLogicGame === 'SLIDING_GLYPH' && (
                <div className="system-window rounded-2xl p-6 border border-cyan-500/50 text-center">
                  <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4 text-left">
                    <button
                      onClick={() => { sounds.playStatAdd(); setSelectedLogicGame(null); }}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition flex items-center gap-1 text-xs font-bold font-orbitron cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Back</span>
                    </button>

                    <div>
                      <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase">
                        SHADOW GATE SLIDING GLYPH
                      </span>
                      <h3 className="text-sm font-bold text-white">
                        Moves Taken: <span className="text-cyan-300 font-mono">{slidingMoves}</span>
                      </h3>
                    </div>

                    <button
                      onClick={handleShuffleSliding}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Shuffle</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-rajdhani mb-5">
                    Slide numerical glyphs in order (1 through 8) to disarm the dungeon security barrier.
                  </p>

                  {/* 3x3 Grid */}
                  <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-6 p-2 rounded-xl bg-slate-950 border border-slate-700">
                    {slidingGrid.map((val, idx) => (
                      <button
                        key={idx}
                        disabled={val === 0 || slidingSolved}
                        onClick={() => handleSlideTile(idx)}
                        className={`h-16 rounded-xl font-orbitron font-black text-xl flex items-center justify-center transition-all ${
                          val === 0
                            ? 'bg-transparent border border-dashed border-slate-800'
                            : 'bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 hover:border-cyan-400 shadow-md shadow-cyan-950/40 active:scale-95'
                        }`}
                      >
                        {val !== 0 ? val : ''}
                      </button>
                    ))}
                  </div>

                  {slidingSolved ? (
                    <div className="p-3 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/40">
                      🎉 GLYPH DISARMED! +2 INT / +2 PER gained.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
