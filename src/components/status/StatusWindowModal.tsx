import React from 'react';
import { UserProfile, UserStats, HunterRank } from '../../types';
import { sounds } from '../../utils/soundEffects';
import { 
  Shield, Zap, Sparkles, Plus, Heart, Award, X, Activity, 
  Swords, Brain, Flame, Eye, ArrowLeft, Edit3, Bell, User, Clock
} from 'lucide-react';

interface StatusWindowProps {
  profile: UserProfile;
  onAllocateStat: (statName: keyof Pick<UserStats, 'strength' | 'agility' | 'vitality' | 'intelligence' | 'perception'>) => void;
  onOpenEditProfile: () => void;
  onOpenMorningReminder: () => void;
  onClose: () => void;
  onSwitchTrack: () => void;
}

export const StatusWindowModal: React.FC<StatusWindowProps> = ({
  profile,
  onAllocateStat,
  onOpenEditProfile,
  onOpenMorningReminder,
  onClose,
  onSwitchTrack,
}) => {
  const { stats } = profile;

  const handleStatClick = (statName: keyof Pick<UserStats, 'strength' | 'agility' | 'vitality' | 'intelligence' | 'perception'>) => {
    if (stats.availableStatPoints > 0) {
      sounds.playStatAdd();
      onAllocateStat(statName);
    } else {
      sounds.playWarning();
    }
  };

  const getRankBadgeColor = (rank: HunterRank) => {
    switch (rank) {
      case 'S-Rank':
      case 'National-Level':
        return 'bg-amber-500/20 text-amber-300 border-amber-400 system-glow-gold';
      case 'A-Rank':
        return 'bg-purple-500/20 text-purple-300 border-purple-400 system-glow-purple';
      case 'B-Rank':
        return 'bg-blue-500/20 text-blue-300 border-blue-400 system-glow-text';
      case 'C-Rank':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400';
      case 'D-Rank':
        return 'bg-teal-500/20 text-teal-300 border-teal-400';
      default:
        return 'bg-slate-700/40 text-cyan-300 border-cyan-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg system-window rounded-2xl p-6 md:p-7 relative border border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.25)] animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Holographic Header Bar with Back Button */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/40 mb-4">
          <button
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold font-orbitron text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-orbitron font-bold tracking-widest text-cyan-400 uppercase">
              STATUS WINDOW
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { sounds.playStatAdd(); onOpenEditProfile(); }}
              title="Edit Profile"
              className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/50 hover:bg-cyan-900 text-cyan-300 text-xs font-bold font-orbitron transition flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => { sounds.playStatAdd(); onClose(); }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player Core Bio Banner */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black font-orbitron text-white">
                    {profile.name}
                  </h2>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded border ${getRankBadgeColor(stats.rank)}`}>
                    {stats.rank}
                  </span>
                </div>
                <p className="text-xs text-cyan-300 font-rajdhani">
                  Nickname: <strong className="text-white">{profile.nickname || stats.title}</strong>
                </p>
                <p className="text-xs text-slate-400 font-rajdhani">
                  Class: <span className="text-purple-300 font-semibold">{stats.className}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black font-orbitron text-cyan-400 system-glow-text">
                LV. {stats.level}
              </div>
              <div className="text-[11px] text-slate-400 font-rajdhani">
                XP: {stats.xp} / {stats.maxXp}
              </div>
            </div>
          </div>

          {/* Hunter Bio/Motto quote if available */}
          {profile.bio && (
            <p className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-rajdhani italic">
              "{profile.bio}"
            </p>
          )}

          {/* Quick Morning Reminder Pill Button */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-rajdhani">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Morning Reminder: </span>
              <strong className="text-cyan-300 font-mono">
                {profile.morningReminder?.enabled ? `${profile.morningReminder.time} AM` : 'Muted'}
              </strong>
            </div>

            <button
              onClick={() => {
                sounds.playStatAdd();
                onOpenMorningReminder();
              }}
              className="text-[11px] font-bold text-cyan-400 hover:text-white underline font-rajdhani cursor-pointer"
            >
              Adjust Reminder Alarm →
            </button>
          </div>
        </div>

        {/* Gauges (HP, MP, Fatigue) */}
        <div className="space-y-2.5 mb-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          {/* HP Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold font-rajdhani mb-1">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> HP (Vitality)
              </span>
              <span className="text-rose-300 font-mono text-[11px]">{stats.hp} / {stats.maxHp}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (stats.hp / stats.maxHp) * 100)}%` }}
              />
            </div>
          </div>

          {/* MP Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold font-rajdhani mb-1">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" /> MP (Mana Pool)
              </span>
              <span className="text-cyan-300 font-mono text-[11px]">{stats.mp} / {stats.maxMp}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (stats.mp / stats.maxMp) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fatigue Gauge */}
          <div>
            <div className="flex justify-between text-xs font-bold font-rajdhani mb-1">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Fatigue Level
              </span>
              <span className="text-amber-300 font-mono text-[11px]">{stats.fatigue} / 100</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, stats.fatigue)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Unallocated Stat Points Banner */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
            <span className="text-xs font-bold font-rajdhani uppercase text-cyan-300">
              Available Attribute Points
            </span>
          </div>
          <span className="text-base font-black font-orbitron text-cyan-400 system-glow-text px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400">
            {stats.availableStatPoints}
          </span>
        </div>

        {/* Attribute Allocation Grid */}
        <div className="space-y-1.5 mb-5 font-rajdhani">
          {/* STR */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400 text-xs font-bold font-orbitron">
                STR
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase">Strength</div>
                <div className="text-[10px] text-slate-400">Muscle power & physical quest output</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-cyan-300">{stats.strength}</span>
              <button
                type="button"
                id="btn-add-str"
                disabled={stats.availableStatPoints <= 0}
                onClick={() => handleStatClick('strength')}
                className="w-7 h-7 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 border border-cyan-400 text-cyan-300 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center font-black cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AGI */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-bold font-orbitron">
                AGI
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase">Agility</div>
                <div className="text-[10px] text-slate-400">Movement speed & squat flexibility</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-cyan-300">{stats.agility}</span>
              <button
                type="button"
                id="btn-add-agi"
                disabled={stats.availableStatPoints <= 0}
                onClick={() => handleStatClick('agility')}
                className="w-7 h-7 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 border border-cyan-400 text-cyan-300 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center font-black cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* VIT */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 text-xs font-bold font-orbitron">
                VIT
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase">Vitality</div>
                <div className="text-[10px] text-slate-400">Maximum HP & stamina recovery rate</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-cyan-300">{stats.vitality}</span>
              <button
                type="button"
                id="btn-add-vit"
                disabled={stats.availableStatPoints <= 0}
                onClick={() => handleStatClick('vitality')}
                className="w-7 h-7 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 border border-cyan-400 text-cyan-300 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center font-black cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* INT */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xs font-bold font-orbitron">
                INT
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase">Intelligence</div>
                <div className="text-[10px] text-slate-400">Mana capacity & chess tactics analysis</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-purple-300">{stats.intelligence}</span>
              <button
                type="button"
                id="btn-add-int"
                disabled={stats.availableStatPoints <= 0}
                onClick={() => handleStatClick('intelligence')}
                className="w-7 h-7 rounded-lg bg-purple-500/20 hover:bg-purple-500 border border-purple-400 text-purple-300 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center font-black cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PER */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-bold font-orbitron">
                PER
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase">Perception</div>
                <div className="text-[10px] text-slate-400">Runic memory precision & danger instinct</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-amber-300">{stats.perception}</span>
              <button
                type="button"
                id="btn-add-per"
                disabled={stats.availableStatPoints <= 0}
                onClick={() => handleStatClick('perception')}
                className="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500 border border-amber-400 text-amber-300 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center font-black cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Pathway Switcher footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-rajdhani">
            Current Track:{' '}
            <strong className={profile.chosenTrack === 'HUNTER' ? 'text-cyan-400' : 'text-purple-400'}>
              {profile.chosenTrack === 'HUNTER' ? '⚔️ Hunter (Physical)' : '♟️ Maze (Cognitive)'}
            </strong>
          </div>
          <button
            onClick={() => { sounds.playStatAdd(); onSwitchTrack(); }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
          >
            Change Track ⇄
          </button>
        </div>
      </div>
    </div>
  );
};
