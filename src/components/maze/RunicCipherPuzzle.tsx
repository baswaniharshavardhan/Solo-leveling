import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { KeyRound, RotateCcw, HelpCircle, Trophy, Sparkles, CheckCircle2, ArrowLeft, Lock, Unlock, Eye } from 'lucide-react';

interface RunicCipherPuzzleProps {
  onRewardClaim: (xp: number, statBonuses: { int?: number; per?: number }) => void;
  onBack?: () => void;
}

interface CipherWord {
  id: string;
  word: string;
  category: string;
  hint: string;
  clue: string;
  difficulty: string;
}

const CIPHER_WORDS: CipherWord[] = [
  {
    id: 'c1',
    word: 'ARISE',
    category: 'Monarch Command',
    hint: 'The single word that commands fallen souls to rise as loyal shadow soldiers.',
    clue: 'Starts with A, ends with E. 5 letters.',
    difficulty: 'E-Rank',
  },
  {
    id: 'c2',
    word: 'SHADOW',
    category: 'Monarch Element',
    hint: 'The dark ethereal mana that dwells in the realm beyond death.',
    clue: 'Synonym for silhouette, opposite of light. 6 letters.',
    difficulty: 'C-Rank',
  },
  {
    id: 'c3',
    word: 'MONARCH',
    category: 'Supreme Title',
    hint: 'Sovereigns of ancient wars who command primal forces of the universe.',
    clue: 'Title held by the 9 supreme rulers. 7 letters.',
    difficulty: 'A-Rank',
  },
  {
    id: 'c4',
    word: 'AWAKENING',
    category: 'Human Evolution',
    hint: 'The rare phenomenon where a human suddenly develops mana and hunter capabilities.',
    clue: 'Rebirth into hunter rank status. 9 letters.',
    difficulty: 'S-Rank',
  },
];

// Map characters to cool runic glyph visual representations
const RUNE_MAP: Record<string, string> = {
  A: 'ᚪ', B: 'ᛒ', C: 'ᚲ', D: 'ᛞ', E: 'ᛖ', F: 'ᚠ', G: 'ᚷ',
  H: 'ᚺ', I: 'ᛁ', J: 'ᛃ', K: 'ᚴ', L: 'ᛚ', M: 'ᛗ', N: 'ᚾ',
  O: 'ᛟ', P: 'ᛈ', Q: 'ᛩ', R: 'ᚱ', S: 'ᛋ', T: 'ᛏ', U: 'ᚢ',
  V: 'ᚡ', W: 'ᚹ', X: 'ᛪ', Y: 'ᛦ', Z: 'ᛎ',
};

export const RunicCipherPuzzle: React.FC<RunicCipherPuzzleProps> = ({
  onRewardClaim,
  onBack,
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const currentCipher = CIPHER_WORDS[wordIndex];

  const [userGuess, setUserGuess] = useState<string[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const initCipher = (cipher: CipherWord) => {
    // Reveal 1 initial letter to get player started
    const firstIdx = 0;
    const initialGuesses = Array(cipher.word.length).fill('');
    initialGuesses[firstIdx] = cipher.word[firstIdx];
    setUserGuess(initialGuesses);
    setRevealedIndices([firstIdx]);
    setIsSolved(false);
    setShowHint(false);
  };

  useEffect(() => {
    initCipher(currentCipher);
  }, [wordIndex]);

  const handleKeyPress = (char: string) => {
    if (isSolved) return;
    sounds.playStatAdd();

    // Find next empty index
    const nextEmpty = userGuess.findIndex((val, idx) => val === '' && !revealedIndices.includes(idx));
    if (nextEmpty !== -1) {
      const nextGuesses = [...userGuess];
      nextGuesses[nextEmpty] = char;
      setUserGuess(nextGuesses);

      // Check if word is complete
      const fullWord = nextGuesses.join('');
      if (fullWord.length === currentCipher.word.length) {
        if (fullWord === currentCipher.word) {
          setIsSolved(true);
          sounds.playLevelUp();
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          const intGain = wordIndex === 0 ? 2 : wordIndex === 1 ? 3 : 5;
          onRewardClaim(100 + wordIndex * 50, { int: intGain, per: 3 });
        } else {
          sounds.playWarning();
        }
      }
    }
  };

  const handleBackspace = () => {
    if (isSolved) return;
    sounds.playStatAdd();

    // Find last user-entered index (not in revealedIndices)
    for (let i = userGuess.length - 1; i >= 0; i--) {
      if (userGuess[i] !== '' && !revealedIndices.includes(i)) {
        const nextGuesses = [...userGuess];
        nextGuesses[i] = '';
        setUserGuess(nextGuesses);
        break;
      }
    }
  };

  const handleRevealClueLetter = () => {
    if (isSolved) return;
    sounds.playStatAdd();

    // Find an unrevealed index
    const unrevealed = currentCipher.word
      .split('')
      .map((_, i) => i)
      .filter((i) => !revealedIndices.includes(i));

    if (unrevealed.length > 0) {
      const pick = unrevealed[0];
      const nextGuesses = [...userGuess];
      nextGuesses[pick] = currentCipher.word[pick];
      setUserGuess(nextGuesses);
      setRevealedIndices([...revealedIndices, pick]);

      if (nextGuesses.join('') === currentCipher.word) {
        setIsSolved(true);
        sounds.playLevelUp();
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        onRewardClaim(80, { int: 2, per: 2 });
      }
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              RUNIC DECRYPTION CIPHER ({currentCipher.difficulty})
            </div>
            <h3 className="text-base font-bold text-white">
              Category: {currentCipher.category}
            </h3>
          </div>
        </div>

        <button
          onClick={() => { sounds.playStatAdd(); initCipher(currentCipher); }}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-400 text-xs font-bold text-slate-300 hover:text-purple-300 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <p className="text-xs text-slate-300 mb-4 font-rajdhani">
        Decode the ancient Monarch word encrypted in high-frequency mana runes. Decrypt each rune using the on-screen keypad.
      </p>

      {/* Cipher Selector */}
      <div className="grid grid-cols-4 gap-1.5 mb-5">
        {CIPHER_WORDS.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => { setWordIndex(idx); sounds.playStatAdd(); }}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold font-orbitron transition border ${
              wordIndex === idx
                ? 'bg-purple-950 text-purple-300 border-purple-400 shadow-md shadow-purple-900/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Trial {idx + 1}
          </button>
        ))}
      </div>

      {/* Encrypted Rune Display & Guess Slots */}
      <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950 border border-purple-500/40 mb-5 shadow-inner">
        {/* Runic Symbols Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {currentCipher.word.split('').map((letter, idx) => (
            <div
              key={idx}
              className="w-10 h-12 rounded-xl bg-purple-950/60 border border-purple-400/50 flex flex-col items-center justify-center text-purple-300"
            >
              <span className="text-lg font-bold font-mono">{RUNE_MAP[letter] || 'ᚱ'}</span>
              <span className="text-[9px] text-purple-400/80 font-mono">#{idx + 1}</span>
            </div>
          ))}
        </div>

        {/* Decrypted Letters Row */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {currentCipher.word.split('').map((_, idx) => {
            const letter = userGuess[idx] || '';
            const isRevealed = revealedIndices.includes(idx);

            return (
              <div
                key={idx}
                className={`w-10 h-12 rounded-xl font-orbitron font-black text-lg flex items-center justify-center border-2 transition-all ${
                  letter
                    ? isRevealed
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400'
                      : 'bg-purple-900/80 text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : 'bg-slate-900 text-slate-500 border-dashed border-slate-700'
                }`}
              >
                {letter || '_'}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 mt-4 text-center font-rajdhani italic">
          "{currentCipher.hint}"
        </p>
      </div>

      {/* Solved Status */}
      {isSolved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-rajdhani font-bold text-center mb-4 flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>CIPHER DECRYPTED: [{currentCipher.word}]! +Intelligence & Perception Acquired.</span>
        </div>
      )}

      {/* Hint Banner */}
      {showHint && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 mb-4 font-rajdhani">
          💡 <strong>System Clue:</strong> {currentCipher.clue}
        </div>
      )}

      {/* Runic Keypad */}
      <div className="mb-4">
        <div className="flex flex-wrap justify-center gap-1 max-w-sm mx-auto">
          {alphabet.map((char) => (
            <button
              key={char}
              disabled={isSolved}
              onClick={() => handleKeyPress(char)}
              className="w-7 h-8 sm:w-8 sm:h-9 rounded-lg bg-slate-900 hover:bg-purple-950/80 active:scale-95 border border-slate-700 hover:border-purple-400 text-slate-200 hover:text-purple-300 font-orbitron font-bold text-xs transition"
            >
              {char}
            </button>
          ))}
          <button
            disabled={isSolved}
            onClick={handleBackspace}
            className="px-2.5 h-8 sm:h-9 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-xs transition"
          >
            DEL
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { sounds.playStatAdd(); setShowHint(!showHint); }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            {showHint ? 'Hide Clue' : 'Monarch Clue'}
          </button>

          <button
            disabled={isSolved || revealedIndices.length >= currentCipher.word.length}
            onClick={handleRevealClueLetter}
            className="px-2.5 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-xs font-bold text-purple-300 flex items-center gap-1 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Reveal 1 Rune</span>
          </button>
        </div>

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
