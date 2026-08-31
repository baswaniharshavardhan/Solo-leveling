import React, { useState } from 'react';
import { UserProfile, TrackType, HunterRank } from '../../types';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  User, Edit3, Shield, Award, Check, X, Sparkles, 
  Swords, Brain, Image, Phone, Mail, FileText, ArrowLeft,
  CheckCircle2, Bell
} from 'lucide-react';

interface EditProfileModalProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onOpenReminderSettings: () => void;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  {
    name: 'Sung Jin-woo (Awakened Monarch)',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Cha Hae-in (Radiant Sword)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Shadow Commander Igris',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Grand Mage Sovereign',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Iron Vanguard Berserker',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Tactical Grandmaster',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
  }
];

const NICKNAME_PRESETS = [
  'Shadow Monarch',
  'The Undefeated',
  'Monarch of Shadows',
  'White Tiger Vanguard',
  'Silver Blade Master',
  'Gate Annihilator',
  'Sovereign of Death',
  'The Solo Leveler'
];

const CLASS_PRESETS = [
  'Shadow Sovereign (Candidate)',
  'Shadow Necromancer',
  'Mage Knight',
  'Shadow Assassin',
  'Iron Tanker',
  'Grandmaster Tactician',
  'Awakened Striker'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  onSaveProfile,
  onOpenReminderSettings,
  onClose,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [nickname, setNickname] = useState(profile.nickname || profile.stats.title || 'Shadow Monarch');
  const [title, setTitle] = useState(profile.stats.title || 'The Awakened');
  const [className, setClassName] = useState(profile.stats.className || 'Shadow Sovereign (Candidate)');
  const [bio, setBio] = useState(profile.bio || 'The only Hunter in the world who can level up endlessly.');
  const [track, setTrack] = useState<TrackType>(profile.chosenTrack || 'HUNTER');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || AVATAR_PRESETS[0].url);
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playLevelUp();
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });

    const updatedProfile: UserProfile = {
      ...profile,
      name: name.trim() || 'Sung Jin-woo',
      nickname: nickname.trim() || 'Shadow Monarch',
      bio: bio.trim(),
      chosenTrack: track,
      avatarUrl,
      email: email.trim(),
      phone: phone.trim(),
      stats: {
        ...profile.stats,
        title: nickname.trim() || title,
        className: className.trim() || profile.stats.className,
      },
    };

    onSaveProfile(updatedProfile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl system-window rounded-2xl p-6 md:p-7 relative border border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.25)] animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-cyan-500/40 mb-5">
          <button
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold font-orbitron text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-orbitron font-bold tracking-widest text-cyan-400 uppercase">
              EDIT PLAYER CREDENTIALS & PROFILE
            </span>
          </div>

          <button
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Preview & Selection */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="block text-xs font-bold font-rajdhani uppercase text-cyan-300 mb-2">
              Hunter Avatar & Crest Selection:
            </label>
            
            <div className="flex items-center gap-4 mb-3">
              <img
                src={avatarUrl}
                alt="Hunter Avatar"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              />
              <div className="flex-1">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Or enter custom image URL..."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-400 font-rajdhani mt-1 block">
                  Select a preset below or paste any custom avatar URL
                </span>
              </div>
            </div>

            {/* Avatar Presets Grid */}
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sounds.playStatAdd();
                    setAvatarUrl(preset.url);
                  }}
                  title={preset.name}
                  className={`relative rounded-lg overflow-hidden border transition cursor-pointer ${
                    avatarUrl === preset.url
                      ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-12 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name & Nickname / Codename Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold font-rajdhani uppercase text-cyan-300 mb-1">
                Hunter Name
              </label>
              <input
                type="text"
                id="edit-hunter-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sung Jin-woo"
                required
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-rajdhani uppercase text-cyan-300 mb-1">
                Hunter Nickname / Codename
              </label>
              <input
                type="text"
                id="edit-hunter-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Shadow Monarch"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Quick Nickname Suggestion Chips */}
          <div>
            <span className="text-[10px] text-slate-400 font-rajdhani mr-1">Codename Presets:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {NICKNAME_PRESETS.map((nick) => (
                <button
                  key={nick}
                  type="button"
                  onClick={() => {
                    sounds.playStatAdd();
                    setNickname(nick);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-rajdhani font-semibold transition cursor-pointer ${
                    nickname === nick
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {nick}
                </button>
              ))}
            </div>
          </div>

          {/* Hunter Track Type Selection */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="block text-xs font-bold font-rajdhani uppercase text-cyan-300 mb-2">
              Ascension Type / Track:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playStatAdd();
                  setTrack('HUNTER');
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  track === 'HUNTER'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Swords className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs font-orbitron font-bold">HUNTER TYPE</div>
                  <div className="text-[10px] text-slate-400 font-rajdhani">30-Day Physical Calisthenics</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playStatAdd();
                  setTrack('MAZE');
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  track === 'MAZE'
                    ? 'bg-purple-950/80 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Brain className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <div className="text-xs font-orbitron font-bold">MAZE TYPE</div>
                  <div className="text-[10px] text-slate-400 font-rajdhani">Tactical Chess & Mana Logic</div>
                </div>
              </button>
            </div>
          </div>

          {/* Job Class & Bio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold font-rajdhani uppercase text-cyan-300 mb-1">
                Assigned Job Class
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Shadow Sovereign"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-purple-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-rajdhani uppercase text-cyan-300 mb-1">
                Contact Phone / SMS
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 789-0142"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Bio / Hunter Motto */}
          <div>
            <label className="block text-xs font-bold font-rajdhani uppercase text-cyan-300 mb-1">
              Hunter Bio / Personal Motto
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter your hunter motto or awakening statement..."
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none font-rajdhani"
            />
          </div>

          {/* Quick link to Morning Reminder Configuration */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="text-xs font-rajdhani">
                <span className="text-white font-bold">Morning Reminder: </span>
                <span className="text-cyan-300 font-mono">
                  {profile.morningReminder?.enabled ? `Active at ${profile.morningReminder.time}` : 'Muted'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playStatAdd();
                onOpenReminderSettings();
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-xs font-orbitron font-bold border border-cyan-500/40 transition cursor-pointer"
            >
              Configure Alarm ⏰
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => { sounds.playStatAdd(); onClose(); }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold font-orbitron transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="btn-save-profile"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-orbitron text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(6,182,212,0.4)] transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  PROFILE SYNCHRONIZED!
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  SAVE PROFILE CHANGES
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
