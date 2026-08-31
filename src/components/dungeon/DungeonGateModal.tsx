import React, { useState } from 'react';
import { DungeonGate, UserProfile } from '../../types';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Skull, Swords, Shield, Trophy, X, Zap, Flame, AlertCircle, ArrowLeft } from 'lucide-react';

interface DungeonGateModalProps {
  gates: DungeonGate[];
  profile: UserProfile;
  onClearGate: (gateId: string, xpReward: number) => void;
  onClose: () => void;
}

export const DungeonGateModal: React.FC<DungeonGateModalProps> = ({
  gates,
  profile,
  onClearGate,
  onClose,
}) => {
  const [activeBattleGate, setActiveBattleGate] = useState<DungeonGate | null>(null);
  const [bossCurrentHp, setBossCurrentHp] = useState<number>(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);

  const startBossRaid = (gate: DungeonGate) => {
    sounds.playLevelUp();
    setActiveBattleGate(gate);
    setBossCurrentHp(gate.bossHp);
    setBattleLog([
      `[SYSTEM NOTICE]: Entering ${gate.name} (${gate.rank}).`,
      `Dungeon Boss [${gate.bossName}] has appeared!`
    ]);
  };

  const handleAttackBoss = () => {
    if (!activeBattleGate || isAttacking) return;
    setIsAttacking(true);
    sounds.playStatAdd();

    // Damage calculated from player stats
    const playerDamage = Math.round(
      profile.stats.strength * 3.5 + 
      profile.stats.agility * 2 + 
      profile.stats.intelligence * 2.5 +
      Math.random() * 20
    );

    const nextHp = Math.max(0, bossCurrentHp - playerDamage);
    setBossCurrentHp(nextHp);

    setBattleLog((prev) => [
      `⚔️ Player dealt ${playerDamage} damage with Dagger Strike!`,
      ...prev.slice(0, 4)
    ]);

    if (nextHp <= 0) {
      sounds.playQuestComplete();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
      setBattleLog((prev) => [
        `🏆 BOSS DEFEATED! Gate subjugation complete!`,
        ...prev
      ]);
      onClearGate(activeBattleGate.id, 250);
      setTimeout(() => {
        setIsAttacking(false);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsAttacking(false);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg system-window rounded-2xl p-6 relative border border-cyan-500/50">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/40 mb-4">
          <button
            onClick={() => {
              sounds.playStatAdd();
              if (activeBattleGate) {
                setActiveBattleGate(null);
              } else {
                onClose();
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-red-400 text-xs font-bold font-orbitron text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-red-400" />
            <span>{activeBattleGate ? 'Flee Gate' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
            <Skull className="w-4 h-4 text-red-400" />
            <span className="text-xs font-orbitron font-bold tracking-widest text-red-400 uppercase">
              DUNGEON GATES & BOSS LAIRS
            </span>
          </div>

          <button
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Boss Raid Arena */}
        {activeBattleGate ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-center">
              <div className="text-xs font-bold text-red-400 uppercase font-orbitron">
                BOSS ENCOUNTER: {activeBattleGate.rank}
              </div>
              <h3 className="text-lg font-black text-white font-orbitron mt-1">
                {activeBattleGate.bossName}
              </h3>

              {/* Boss HP Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs font-mono text-red-300 mb-1">
                  <span>Boss HP</span>
                  <span>{bossCurrentHp} / {activeBattleGate.bossHp}</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-[1px] border border-red-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, (bossCurrentHp / activeBattleGate.bossHp) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Battle Logs */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1 min-h-[90px]">
              {battleLog.map((log, idx) => (
                <div key={idx} className={idx === 0 ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                  {log}
                </div>
              ))}
            </div>

            {/* Battle Actions */}
            {bossCurrentHp > 0 ? (
              <button
                disabled={isAttacking}
                onClick={handleAttackBoss}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black font-orbitron text-sm tracking-wider uppercase transition shadow-lg shadow-red-900/50 flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                EXECUTE HUNTER STRIKE
              </button>
            ) : (
              <button
                onClick={() => setActiveBattleGate(null)}
                className="w-full py-3 rounded-xl bg-emerald-600 text-slate-950 font-black font-orbitron text-xs tracking-wider uppercase transition"
              >
                RETURN TO GATE REGISTRY
              </button>
            )}
          </div>
        ) : (
          /* Gate List */
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {gates.map((gate) => {
              const isLocked = profile.stats.level < gate.requiredLevel;

              return (
                <div
                  key={gate.id}
                  className={`p-4 rounded-xl border transition-all ${
                    gate.cleared
                      ? 'bg-slate-950/60 border-slate-800 opacity-60'
                      : gate.type === 'RED_GATE'
                      ? 'bg-red-950/30 border-red-500/40 hover:border-red-400'
                      : 'bg-slate-900/90 border-cyan-500/30 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black font-orbitron border ${
                        gate.rank === 'S-Rank' ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-cyan-950 text-cyan-300 border-cyan-500'
                      }`}>
                        {gate.rank}
                      </span>
                      <h4 className="text-sm font-bold text-white">{gate.name}</h4>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      Req Lv. {gate.requiredLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-rajdhani">
                    Boss: <strong className="text-white">{gate.bossName}</strong>
                  </p>
                  <p className="text-[11px] text-cyan-300 font-rajdhani mt-0.5">
                    Rewards: {gate.rewardsDescription}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
                    {gate.cleared ? (
                      <span className="text-xs font-bold text-emerald-400">
                        GATE CONQUERED ✓
                      </span>
                    ) : isLocked ? (
                      <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Locked (Requires Lv. {gate.requiredLevel})
                      </span>
                    ) : (
                      <button
                        onClick={() => startBossRaid(gate)}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black font-orbitron transition flex items-center gap-1.5 shadow-md shadow-red-900/40"
                      >
                        <Swords className="w-3.5 h-3.5" /> ENTER GATE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
