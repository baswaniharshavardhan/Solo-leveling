import React from 'react';
import { UserProfile } from '../../types';
import { sounds } from '../../utils/soundEffects';
import { 
  Sparkles, Volume2, VolumeX, Shield, Package, Skull, 
  Code, Download, RotateCcw, User, Heart, Zap, Flame,
  Bell, Edit3, Smartphone
} from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStatus: () => void;
  onOpenEditProfile: () => void;
  onOpenMorningReminder: () => void;
  onOpenInventory: () => void;
  onOpenDungeon: () => void;
  onOpenArchitecture: () => void;
  onOpenBackup: () => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  soundEnabled,
  onToggleSound,
  onOpenStatus,
  onOpenEditProfile,
  onOpenMorningReminder,
  onOpenInventory,
  onOpenDungeon,
  onOpenArchitecture,
  onOpenBackup,
  onInstallPwa,
  canInstallPwa,
}) => {
  const { stats } = profile;

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/30 px-3 sm:px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Player Status Avatar Chip (Clickable for Status Window) */}
        <button
          onClick={() => { sounds.playStatAdd(); onOpenStatus(); }}
          className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition group text-left cursor-pointer"
        >
          <div className="relative">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-lg object-cover border border-cyan-400/60 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 px-1 rounded bg-cyan-950 text-[9px] font-black font-orbitron text-cyan-300 border border-cyan-500">
              {stats.rank.split('-')[0]}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black font-orbitron text-white group-hover:text-cyan-300 transition">
                LV. {stats.level}
              </span>
              {stats.availableStatPoints > 0 && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-rajdhani block leading-tight">
              {profile.nickname || profile.name.split(' ')[0]}
            </span>
          </div>
        </button>

        {/* Center: Live Vitals Mini-Bar (HP & MP) */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] font-rajdhani">
          <div className="flex items-center gap-1 text-rose-400">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span className="font-mono text-[10px]">{stats.hp}/{stats.maxHp}</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-400">
            <Zap className="w-3.5 h-3.5 fill-cyan-400" />
            <span className="font-mono text-[10px]">{stats.mp}/{stats.maxMp}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[10px]">{stats.fatigue}</span>
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Morning Reminder Alarm Button */}
          <button
            onClick={() => { sounds.playStatAdd(); onOpenMorningReminder(); }}
            title={`Morning Reminder: ${profile.morningReminder?.enabled ? profile.morningReminder.time : 'Off'}`}
            className={`relative p-2 rounded-lg border transition cursor-pointer ${
              profile.morningReminder?.enabled
                ? 'bg-cyan-950/80 border-cyan-400/80 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            {profile.morningReminder?.enabled && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          {/* Edit Profile Button */}
          <button
            onClick={() => { sounds.playStatAdd(); onOpenEditProfile(); }}
            title="Edit Hunter Profile"
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Inventory Button */}
          <button
            onClick={() => { sounds.playStatAdd(); onOpenInventory(); }}
            title="Inventory & Recovery Items"
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition cursor-pointer"
          >
            <Package className="w-4 h-4" />
          </button>

          {/* Dungeon Boss Lair */}
          <button
            onClick={() => { sounds.playStatAdd(); onOpenDungeon(); }}
            title="Dungeon Gates"
            className="p-2 rounded-lg bg-slate-900 border border-red-500/40 hover:border-red-400 text-red-300 transition cursor-pointer"
          >
            <Skull className="w-4 h-4" />
          </button>

          {/* Architecture & Starter Code Modal */}
          <button
            onClick={() => { sounds.playStatAdd(); onOpenArchitecture(); }}
            title="Architecture & Starter Code"
            className="hidden md:flex px-2.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/60 hover:bg-cyan-900 text-cyan-300 text-xs font-bold font-orbitron transition items-center gap-1 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Arch/Code</span>
          </button>

          {/* Backup / Export */}
          <button
            onClick={() => { sounds.playStatAdd(); onOpenBackup(); }}
            title="Offline Backup & Sync"
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute System Audio' : 'Enable System Audio'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
