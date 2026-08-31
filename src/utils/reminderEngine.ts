import { MorningReminderConfig, DailyHunterQuest, UserProfile } from '../types';
import { sounds } from './soundEffects';

export const MONARCH_MORNING_QUOTES = [
  {
    quote: "Get up. An awakened hunter does not linger in slumber while the gates open.",
    author: "Sung Jin-woo",
    rank: "Shadow Monarch"
  },
  {
    quote: "The System does not wait. Every morning of disciplined repetition brings you closer to the Monarch's crown.",
    author: "System Architect",
    rank: "Grandmaster"
  },
  {
    quote: "Pain is merely mana circulating through your unrefined vessels. Rise and conquer today's quota.",
    author: "Cha Hae-in",
    rank: "S-Rank Hunter"
  },
  {
    quote: "The difference between an E-Rank and a National-Level hunter is what you do in the early hours.",
    author: "Go Gun-hee",
    rank: "Hunter Association Chairman"
  },
  {
    quote: "ARISE! Let your shadow army witness your daily ascension.",
    author: "Shadow Sovereign",
    rank: "Monarch"
  }
];

export const ReminderEngine = {
  // Request notification permissions
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  },

  getNotificationPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  // Check if current time matches scheduled morning reminder and hasn't fired today
  checkAndTriggerReminder(profile: UserProfile, todayQuest?: DailyHunterQuest): boolean {
    const config = profile.morningReminder;
    if (!config || !config.enabled || !config.time) return false;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    const todayDateStr = now.toISOString().split('T')[0];
    const lastTriggerDate = localStorage.getItem('solo_leveling_last_reminder_date');

    // Trigger if time matches and hasn't triggered today
    if (currentTimeStr === config.time && lastTriggerDate !== todayDateStr) {
      this.triggerMorningAlert(profile, todayQuest);
      try {
        localStorage.setItem('solo_leveling_last_reminder_date', todayDateStr);
      } catch {
        // ignore
      }
      return true;
    }

    return false;
  },

  // Trigger a full morning alert (Web notification + Audio + Vibration + Return alert payload)
  triggerMorningAlert(
    profile: UserProfile,
    todayQuest?: DailyHunterQuest
  ): { title: string; body: string; quote: typeof MONARCH_MORNING_QUOTES[0] } {
    const config = profile.morningReminder;
    const quote = MONARCH_MORNING_QUOTES[Math.floor(Math.random() * MONARCH_MORNING_QUOTES.length)];

    let lines: string[] = [];

    if (config?.notifyPushups && todayQuest) {
      const totalReps = todayQuest.exercises.reduce((acc, ex) => acc + ex.targetCount, 0);
      lines.push(`⚔️ Daily Physical Quota: ${totalReps} Total Reps / Distance awaiting!`);
    }

    if (config?.notifyMazeTactics) {
      lines.push(`🧠 Mana Circuit & Logic Gates: Sharpen your intellect before gates open.`);
    }

    if (config?.notifyPenaltyWarning) {
      lines.push(`⚠️ Penalty Zone Warning: Complete daily trial before midnight.`);
    }

    if (config?.notifyMotivationalQuote) {
      lines.push(`📜 "${quote.quote}" - ${quote.author}`);
    }

    const title = `[ SYSTEM MORNING BRIEFING ] - Hunter ${profile.name}`;
    const body = lines.join('\n') || config?.customMessage || "Rise and level up!";

    // Sound alert
    if (config?.soundAlert && profile.soundEnabled) {
      sounds.playLevelUp();
    }

    // Vibration API
    if (config?.vibrationAlert && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch {
        // ignore
      }
    }

    // Web Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: profile.avatarUrl || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'solo-leveling-morning-reminder',
        });
      } catch {
        // ignore web notification error
      }
    }

    return { title, body, quote };
  }
};
