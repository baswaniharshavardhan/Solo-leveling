import React, { useState } from 'react';
import { UserProfile, MorningReminderConfig, DailyHunterQuest } from '../../types';
import { ReminderEngine, MONARCH_MORNING_QUOTES } from '../../utils/reminderEngine';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  Bell, Clock, Volume2, Sparkles, Check, X, ShieldAlert, 
  Swords, Brain, Flame, MessageSquare, ArrowLeft, Play,
  Smartphone, Award, CheckCircle2
} from 'lucide-react';

interface MorningReminderModalProps {
  profile: UserProfile;
  todayQuest?: DailyHunterQuest;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onClose: () => void;
}

export const MorningReminderModal: React.FC<MorningReminderModalProps> = ({
  profile,
  todayQuest,
  onUpdateProfile,
  onClose,
}) => {
  const [config, setConfig] = useState<MorningReminderConfig>(
    profile.morningReminder || {
      enabled: true,
      time: '07:00',
      notifyPushups: true,
      notifyMazeTactics: true,
      notifyPenaltyWarning: true,
      notifyMotivationalQuote: true,
      soundAlert: true,
      vibrationAlert: true,
      customMessage: 'The Daily Quest has arrived. Rise, Hunter!',
    }
  );

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    ReminderEngine.getNotificationPermissionStatus()
  );

  const [simulatedAlert, setSimulatedAlert] = useState<{
    title: string;
    body: string;
    quote: typeof MONARCH_MORNING_QUOTES[0];
  } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRequestPermission = async () => {
    sounds.playStatAdd();
    const status = await ReminderEngine.requestNotificationPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      sounds.playLevelUp();
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleTestAlarm = () => {
    sounds.playLevelUp();
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.5 } });
    const alertResult = ReminderEngine.triggerMorningAlert(
      { ...profile, morningReminder: config },
      todayQuest
    );
    setSimulatedAlert(alertResult);
  };

  const handleSave = () => {
    sounds.playLevelUp();
    const updated: UserProfile = {
      ...profile,
      morningReminder: config,
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const QUICK_TIMES = ['05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '09:00'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl system-window rounded-2xl p-6 md:p-7 relative border border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.25)] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Holographic Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-cyan-500/40 mb-5">
          <button
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold font-orbitron text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span className="text-xs font-orbitron font-bold tracking-widest text-cyan-400 uppercase">
              MORNING REMINDER SYSTEM
            </span>
          </div>

          <button
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Active Status Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${
              config.enabled 
                ? 'bg-cyan-950 text-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-orbitron text-white flex items-center gap-2">
                DAILY MORNING AWAKENING
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  config.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {config.enabled ? 'ACTIVE' : 'MUTED'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Scheduled daily morning broadcast for selected workout and puzzle quotas
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => {
                sounds.playStatAdd();
                setConfig((prev) => ({ ...prev, enabled: e.target.checked }));
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* Reminder Time Picker & Quick Chips */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold font-rajdhani uppercase text-cyan-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Wake-Up / Reminder Time
            </label>
            <input
              type="time"
              value={config.time}
              onChange={(e) => {
                sounds.playStatAdd();
                setConfig((prev) => ({ ...prev, time: e.target.value }));
              }}
              className="px-3 py-1.5 bg-slate-950 border border-cyan-500/50 rounded-lg text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[10px] text-slate-400 font-rajdhani self-center mr-1">Quick Select:</span>
            {QUICK_TIMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  sounds.playStatAdd();
                  setConfig((prev) => ({ ...prev, time: t }));
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  config.time === t
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Selection of Reminder Content (What to be reminded of every morning) */}
        <div className="mb-5">
          <div className="text-xs font-bold font-rajdhani uppercase text-slate-300 tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Select Daily Morning Content to Receive:
          </div>

          <div className="space-y-2 font-rajdhani">
            {/* 1. Physical Workout Quota */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Swords className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase">Daily Physical Regime</div>
                  <div className="text-[11px] text-slate-400">Remind today's pushups, situps, squats & run targets</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.notifyPushups}
                onChange={(e) => {
                  sounds.playStatAdd();
                  setConfig((prev) => ({ ...prev, notifyPushups: e.target.checked }));
                }}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-950 border-slate-700"
              />
            </label>

            {/* 2. Maze & Cognitive Logic Briefing */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase">Maze Logic & Chess Tactics</div>
                  <div className="text-[11px] text-slate-400">Remind daily intellect and mana circuit calibration</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.notifyMazeTactics}
                onChange={(e) => {
                  sounds.playStatAdd();
                  setConfig((prev) => ({ ...prev, notifyMazeTactics: e.target.checked }));
                }}
                className="w-4 h-4 rounded text-purple-500 focus:ring-purple-400 bg-slate-950 border-slate-700"
              />
            </label>

            {/* 3. Penalty Zone Countdown Alert */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase">Penalty Zone Warning</div>
                  <div className="text-[11px] text-slate-400">Avoid failing daily quests and monster zone teleportation</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.notifyPenaltyWarning}
                onChange={(e) => {
                  sounds.playStatAdd();
                  setConfig((prev) => ({ ...prev, notifyPenaltyWarning: e.target.checked }));
                }}
                className="w-4 h-4 rounded text-red-500 focus:ring-red-400 bg-slate-950 border-slate-700"
              />
            </label>

            {/* 4. Monarch Awakening Quote */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase">Monarch Motivational Quote</div>
                  <div className="text-[11px] text-slate-400">Daily awakening inspiration from Sung Jin-woo & S-Rank Hunters</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.notifyMotivationalQuote}
                onChange={(e) => {
                  sounds.playStatAdd();
                  setConfig((prev) => ({ ...prev, notifyMotivationalQuote: e.target.checked }));
                }}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700"
              />
            </label>

            {/* 5. Sound Chime & Audio Alert */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase">Sound & Awakening Chime</div>
                  <div className="text-[11px] text-slate-400">Play system level-up chime upon morning notification</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.soundAlert}
                onChange={(e) => {
                  sounds.playStatAdd();
                  setConfig((prev) => ({ ...prev, soundAlert: e.target.checked }));
                }}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-950 border-slate-700"
              />
            </label>
          </div>
        </div>

        {/* Custom Awakening Call */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 mb-5">
          <label className="block text-xs font-bold font-rajdhani text-cyan-300 uppercase mb-1.5">
            Custom Morning Battle Cry / Note:
          </label>
          <input
            type="text"
            value={config.customMessage || ''}
            onChange={(e) => setConfig((prev) => ({ ...prev, customMessage: e.target.value }))}
            placeholder="e.g. Arise! Become the Monarch today!"
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Browser Permission & Test Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 mb-5">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <div className="text-xs font-rajdhani">
              <span className="text-slate-300">Push Status: </span>
              <strong className={permissionStatus === 'granted' ? 'text-emerald-400' : 'text-amber-400'}>
                {permissionStatus === 'granted' ? '✓ Browser Notifications Enabled' : '⚠ Requires Notification Permission'}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-orbitron transition cursor-pointer"
              >
                Enable Push
              </button>
            )}

            <button
              type="button"
              onClick={handleTestAlarm}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs font-orbitron transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-300" />
              Test Morning Alarm
            </button>
          </div>
        </div>

        {/* Live Simulation Alert Display */}
        {simulatedAlert && (
          <div className="p-4 rounded-xl bg-cyan-950/70 border-2 border-cyan-400/80 mb-5 animate-in fade-in zoom-in-95 duration-200 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-orbitron font-black text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
                {simulatedAlert.title}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-900/80 text-[10px] font-mono text-cyan-200">
                ⏰ {config.time} AM
              </span>
            </div>

            <div className="whitespace-pre-line text-xs font-rajdhani text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30">
              {simulatedAlert.body}
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-cyan-400 font-rajdhani">
              <span>✦ Morning awakening synchronized</span>
              <button
                type="button"
                onClick={() => setSimulatedAlert(null)}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Dismiss Test
              </button>
            </div>
          </div>
        )}

        {/* Save & Confirm Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold font-orbitron transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-orbitron text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(6,182,212,0.4)] transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                REMINDER SAVED!
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                SAVE MORNING REMINDER
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
