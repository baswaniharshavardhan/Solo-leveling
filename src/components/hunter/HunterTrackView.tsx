import React, { useState, useEffect } from 'react';
import { DailyHunterQuest, ExerciseItem, UserProfile } from '../../types';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  Flame, CheckCircle, Clock, AlertTriangle, Dumbbell, Activity, 
  Zap, Trophy, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, 
  Sparkles, ShieldAlert, Award, Calendar, ArrowLeft
} from 'lucide-react';

interface HunterTrackViewProps {
  hunterPlan: DailyHunterQuest[];
  onUpdatePlan: (updated: DailyHunterQuest[]) => void;
  profile: UserProfile;
  onRewardClaim: (xp: number, statBonuses: { str?: number; agi?: number; vit?: number }) => void;
  onSwitchTrack?: () => void;
}

export const HunterTrackView: React.FC<HunterTrackViewProps> = ({
  hunterPlan,
  onUpdatePlan,
  profile,
  onRewardClaim,
  onSwitchTrack,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInitial, setTimerInitial] = useState<number>(60);
  const [showEvolutionMap, setShowEvolutionMap] = useState(false);

  const currentQuest = hunterPlan.find((q) => q.dayNumber === selectedDay) || hunterPlan[0];

  // Rest Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && activeTimer !== null && activeTimer > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) => {
          if (prev === null || prev <= 1) {
            sounds.playLevelUp();
            setIsTimerRunning(false);
            return 0;
          }
          if (prev <= 4) {
            sounds.playStatAdd();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimer]);

  const handleStartTimer = (seconds: number) => {
    sounds.playStatAdd();
    setTimerInitial(seconds);
    setActiveTimer(seconds);
    setIsTimerRunning(true);
  };

  const handleToggleTimer = () => {
    sounds.playStatAdd();
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    sounds.playStatAdd();
    setActiveTimer(timerInitial);
    setIsTimerRunning(false);
  };

  const handleUpdateRep = (exerciseId: string, delta: number) => {
    sounds.playStatAdd();
    const updatedPlan = hunterPlan.map((q) => {
      if (q.dayNumber !== selectedDay) return q;
      const updatedExercises = q.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newCount = Math.max(0, Math.min(ex.targetCount, ex.completedCount + delta));
        return { ...ex, completedCount: newCount };
      });
      return { ...q, exercises: updatedExercises };
    });
    onUpdatePlan(updatedPlan);
  };

  const handleSetCompleted = (exerciseId: string) => {
    sounds.playStatAdd();
    const updatedPlan = hunterPlan.map((q) => {
      if (q.dayNumber !== selectedDay) return q;
      const updatedExercises = q.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const isDone = ex.completedCount >= ex.targetCount;
        return { ...ex, completedCount: isDone ? 0 : ex.targetCount };
      });
      return { ...q, exercises: updatedExercises };
    });
    onUpdatePlan(updatedPlan);
  };

  const areAllExercisesDone = currentQuest.exercises.every(
    (ex) => ex.completedCount >= ex.targetCount
  );

  const handleCompleteDailyQuest = () => {
    if (!areAllExercisesDone || currentQuest.isCompleted) return;

    sounds.playQuestComplete();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#3b82f6', '#a855f7', '#fbbf24']
    });

    const updatedPlan = hunterPlan.map((q) => {
      if (q.dayNumber === selectedDay) {
        return {
          ...q,
          isCompleted: true,
          completedAt: new Date().toISOString()
        };
      }
      return q;
    });

    onUpdatePlan(updatedPlan);

    // Calculate total rewards
    let totalXp = 100;
    let strBonus = 1;
    let agiBonus = 1;
    let vitBonus = 1;

    currentQuest.exercises.forEach((ex) => {
      totalXp += ex.xpReward;
      if (ex.statReward === 'strength') strBonus += 1;
      if (ex.statReward === 'agility') agiBonus += 1;
      if (ex.statReward === 'vitality') vitBonus += 1;
    });

    onRewardClaim(totalXp, { str: strBonus, agi: agiBonus, vit: vitBonus });
  };

  const getExerciseIcon = (name: string) => {
    switch (name) {
      case 'Push-ups': return <Dumbbell className="w-4 h-4 text-rose-400" />;
      case 'Sit-ups': return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'Squats': return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'Running / Sprint': return <Flame className="w-4 h-4 text-amber-400" />;
      default: return <Dumbbell className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* 30-Day Evolution Header & Day Selector Carousel */}
      <div className="system-window rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {onSwitchTrack && (
              <button
                onClick={() => { sounds.playStatAdd(); onSwitchTrack(); }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold font-orbitron text-slate-300 hover:text-white transition flex items-center gap-1 border border-slate-700 cursor-pointer"
                title="Return to Pathway Selection"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pathways</span>
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black font-orbitron text-cyan-300 uppercase tracking-wider">
                30-DAY PHYSICAL EVOLUTION REGIME
              </span>
            </div>
          </div>

          <button
            onClick={() => { sounds.playStatAdd(); setShowEvolutionMap(!showEvolutionMap); }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold font-rajdhani flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            {showEvolutionMap ? 'Close Timeline' : 'View 30-Day Map'}
          </button>
        </div>

        {/* 30-Day Timeline Grid Drawer */}
        {showEvolutionMap && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Ascension Milestones</span>
              <span className="text-cyan-400">Day 1 (E-Rank) → Day 30 (S-Rank Monarch)</span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-1">
              {hunterPlan.map((quest) => (
                <button
                  key={quest.dayNumber}
                  onClick={() => { setSelectedDay(quest.dayNumber); sounds.playStatAdd(); }}
                  className={`p-2 rounded-lg text-xs font-mono font-bold flex flex-col items-center justify-center transition border ${
                    quest.dayNumber === selectedDay
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black scale-105 shadow-md shadow-cyan-500/40'
                      : quest.isCompleted
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span>D{quest.dayNumber}</span>
                  {quest.isCompleted && <CheckCircle className="w-3 h-3 mt-0.5" />}
                  {quest.dayNumber === 30 && <Trophy className="w-3 h-3 text-amber-400 mt-0.5" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Day Stepper Control */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            disabled={selectedDay <= 1}
            onClick={() => { setSelectedDay((d) => Math.max(1, d - 1)); sounds.playStatAdd(); }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="text-sm font-black font-orbitron text-white">
              DAY {currentQuest.dayNumber} / 30
            </div>
            <div className="text-[11px] font-rajdhani text-cyan-400">
              {currentQuest.title}
            </div>
          </div>

          <button
            disabled={selectedDay >= 30}
            onClick={() => { setSelectedDay((d) => Math.min(30, d + 1)); sounds.playStatAdd(); }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Solo Leveling System Quest Box */}
      <div className="system-window rounded-2xl p-5 md:p-6 border border-cyan-500/60 relative overflow-hidden">
        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/40 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-orbitron font-bold tracking-widest text-cyan-400 uppercase">
              [ DAILY QUEST: PREPARING TO BECOME STRONG ]
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
            currentQuest.isCompleted 
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' 
              : 'bg-amber-950 text-amber-400 border border-amber-500/50'
          }`}>
            {currentQuest.isCompleted ? 'QUEST CLEARED' : 'IN PROGRESS'}
          </span>
        </div>

        {/* Solo Leveling Flavor Warning */}
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 mb-5 font-rajdhani whitespace-pre-line leading-relaxed">
          {currentQuest.flavorText}
        </div>

        {/* Penalty Zone Warning Countdown */}
        {!currentQuest.isCompleted && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs mb-5 font-rajdhani">
            <div className="flex items-center gap-2 text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>Penalty Zone Teleportation Warning:</span>
            </div>
            <span className="font-mono font-bold text-red-400 tracking-wider">
              03:42:19 REMAINING
            </span>
          </div>
        )}

        {/* Exercises Checklist & Interactive Rep Counters */}
        <div className="space-y-3 mb-6">
          {currentQuest.exercises.map((ex) => {
            const isDone = ex.completedCount >= ex.targetCount;
            const percent = Math.min(100, Math.round((ex.completedCount / ex.targetCount) * 100));

            return (
              <div
                key={ex.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                      {getExerciseIcon(ex.name)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{ex.name}</span>
                        <span className="text-[11px] font-mono text-cyan-400">
                          [{ex.completedCount} / {ex.targetCount} {ex.unit}]
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-rajdhani">
                        {ex.instruction}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSetCompleted(ex.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-rajdhani transition flex items-center gap-1.5 ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isDone ? 'Done' : 'Mark Done'}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Quick Rep Increment Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-[11px] text-slate-400 font-rajdhani">
                    Reward: <strong className="text-cyan-300">+{ex.xpReward} XP</strong>, <strong className="text-purple-300">+{ex.statReward.toUpperCase()}</strong>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateRep(ex.id, -5)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleUpdateRep(ex.id, 5)}
                      className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[11px] font-mono font-bold"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleUpdateRep(ex.id, 10)}
                      className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[11px] font-mono font-black"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Claim Quest Reward Button */}
        <button
          type="button"
          disabled={!areAllExercisesDone || currentQuest.isCompleted}
          onClick={handleCompleteDailyQuest}
          className={`w-full py-3.5 px-4 rounded-xl font-black font-orbitron text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
            currentQuest.isCompleted
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 cursor-default'
              : areAllExercisesDone
              ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.6)] animate-pulse cursor-pointer'
              : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
          }`}
        >
          {currentQuest.isCompleted ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              DAILY REWARDS CLAIMED (+XP & STATS)
            </span>
          ) : areAllExercisesDone ? (
            <span className="flex items-center gap-2 text-slate-950">
              <Trophy className="w-4 h-4 fill-slate-950" />
              CLAIM SYSTEM REWARDS & EVOLVE
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              COMPLETE ALL EXERCISES TO CLAIM REWARDS
            </span>
          )}
        </button>
      </div>

      {/* Built-in Workout Assistant & Rest Interval Timer */}
      <div className="system-window rounded-2xl p-5 border border-slate-700/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold font-orbitron text-white uppercase">
              WORKOUT REST INTERVAL TIMER
            </span>
          </div>

          {activeTimer !== null && (
            <span className="text-lg font-black font-mono text-cyan-400 system-glow-text">
              {Math.floor(activeTimer / 60)}:{(activeTimer % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[30, 60, 90, 120].map((sec) => (
            <button
              key={sec}
              onClick={() => handleStartTimer(sec)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-xs font-bold text-slate-300 hover:text-cyan-300 transition"
            >
              {sec}s Rest
            </button>
          ))}

          {activeTimer !== null && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleToggleTimer}
                className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={handleResetTimer}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
