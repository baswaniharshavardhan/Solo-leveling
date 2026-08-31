import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, DailyHunterQuest, InventoryItem, DungeonGate, 
  TrackType, UserStats, HunterRank 
} from './types';
import { Storage, DEFAULT_USER_PROFILE } from './utils/storage';
import { sounds } from './utils/soundEffects';
import { ReminderEngine } from './utils/reminderEngine';
import { AuthScreen } from './components/auth/AuthScreen';
import { PathSelectionModal } from './components/path/PathSelectionModal';
import { StatusWindowModal } from './components/status/StatusWindowModal';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { MorningReminderModal } from './components/reminders/MorningReminderModal';
import { HunterTrackView } from './components/hunter/HunterTrackView';
import { MazeTrackView } from './components/maze/MazeTrackView';
import { InventoryModal } from './components/inventory/InventoryModal';
import { DungeonGateModal } from './components/dungeon/DungeonGateModal';
import { ArchitectureModal } from './components/dev/ArchitectureModal';
import { LevelUpModal } from './components/common/LevelUpModal';
import { BackupModal } from './components/common/BackupModal';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Sparkles, Swords, Brain, User, Shield, Info, Smartphone, Bell, Download } from 'lucide-react';

export default function App() {
  // -------------------------------------------------------------
  // PRIMARY APPLICATION STATE (100% Offline via LocalStorage)
  // -------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('solo_leveling_authenticated');
    } catch {
      return false;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => Storage.getUserProfile());
  const [hunterPlan, setHunterPlan] = useState<DailyHunterQuest[]>(() => Storage.getHunterPlan());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => Storage.getInventory());
  const [gates, setGates] = useState<DungeonGate[]>(() => Storage.getGates());
  const [completedPuzzles, setCompletedPuzzles] = useState<string[]>(() => Storage.getCompletedPuzzles());

  // Modals & UI View Flags
  const [showPathSelection, setShowPathSelection] = useState<boolean>(false);
  const [showStatusWindow, setShowStatusWindow] = useState<boolean>(false);
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [showMorningReminder, setShowMorningReminder] = useState<boolean>(false);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showDungeon, setShowDungeon] = useState<boolean>(false);
  const [showArchitecture, setShowArchitecture] = useState<boolean>(false);
  const [showBackup, setShowBackup] = useState<boolean>(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; points: number } | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // PWA Install Prompt state
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);

  // Listen for PWA installation prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsPwaInstalled(true);
        sounds.playLevelUp();
      }
      setDeferredInstallPrompt(null);
    }
  };

  // Sync sound settings
  useEffect(() => {
    sounds.setSoundEnabled(profile.soundEnabled ?? true);
  }, [profile.soundEnabled]);

  // Sync to offline Storage on state changes
  useEffect(() => {
    Storage.saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    Storage.saveHunterPlan(hunterPlan);
  }, [hunterPlan]);

  useEffect(() => {
    Storage.saveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    Storage.saveGates(gates);
  }, [gates]);

  useEffect(() => {
    Storage.saveCompletedPuzzles(completedPuzzles);
  }, [completedPuzzles]);

  // Background Morning Reminder Check Loop
  useEffect(() => {
    const checkReminder = () => {
      if (profile.morningReminder?.enabled) {
        ReminderEngine.checkAndTriggerReminder(profile);
      }
    };

    // Initial check
    checkReminder();

    // Periodic check every 30 seconds
    const interval = setInterval(checkReminder, 30000);
    return () => clearInterval(interval);
  }, [profile]);

  // -------------------------------------------------------------
  // AUTHENTICATION HANDLERS
  // -------------------------------------------------------------
  const handleAuthenticated = (data: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...profile,
      ...data,
      stats: profile.stats || DEFAULT_USER_PROFILE.stats,
    };
    setProfile(updated);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('solo_leveling_authenticated', 'true');
    } catch {
      // ignore
    }

    if (!updated.chosenTrack) {
      setShowPathSelection(true);
    }
  };

  const handleSelectTrack = (track: TrackType) => {
    const updated = {
      ...profile,
      chosenTrack: track,
    };
    setProfile(updated);
    setShowPathSelection(false);
  };

  // -------------------------------------------------------------
  // LEVEL PROGRESSION & REWARDS ENGINE
  // -------------------------------------------------------------
  const handleGainRewards = useCallback(
    (
      xpGain: number,
      statBonuses?: {
        str?: number;
        agi?: number;
        vit?: number;
        int?: number;
        per?: number;
      }
    ) => {
      setProfile((prev) => {
        let currentXp = prev.stats.xp + xpGain;
        let currentLevel = prev.stats.level;
        let maxXp = prev.stats.maxXp;
        let statPoints = prev.stats.availableStatPoints;
        let leveledUp = false;

        // Check if level threshold crossed
        while (currentXp >= maxXp) {
          currentXp -= maxXp;
          currentLevel += 1;
          maxXp = Math.round(maxXp * 1.35);
          statPoints += 5;
          leveledUp = true;
        }

        // Rank evaluation based on level
        let newRank: HunterRank = 'E-Rank';
        let newTitle = prev.stats.title;
        let newClass = prev.stats.className;

        if (currentLevel >= 30) {
          newRank = 'National-Level';
          newTitle = 'Monarch of Shadows';
          newClass = 'Shadow Monarch';
        } else if (currentLevel >= 20) {
          newRank = 'S-Rank';
          newTitle = 'The Ruler of Necromancy';
          newClass = 'Shadow Sovereign';
        } else if (currentLevel >= 15) {
          newRank = 'A-Rank';
          newTitle = 'Elite Gate Crusher';
          newClass = 'Shadow Lord';
        } else if (currentLevel >= 10) {
          newRank = 'B-Rank';
          newTitle = 'Veteran Striker';
          newClass = 'Mage Knight';
        } else if (currentLevel >= 5) {
          newRank = 'C-Rank';
          newTitle = 'Awakened Pioneer';
        } else if (currentLevel >= 3) {
          newRank = 'D-Rank';
          newTitle = 'Rookie Hunter';
        }

        const newStats: UserStats = {
          ...prev.stats,
          level: currentLevel,
          xp: currentXp,
          maxXp,
          availableStatPoints: statPoints,
          strength: prev.stats.strength + (statBonuses?.str || 0),
          agility: prev.stats.agility + (statBonuses?.agi || 0),
          vitality: prev.stats.vitality + (statBonuses?.vit || 0),
          intelligence: prev.stats.intelligence + (statBonuses?.int || 0),
          perception: prev.stats.perception + (statBonuses?.per || 0),
          maxHp: 100 + currentLevel * 20 + (prev.stats.vitality + (statBonuses?.vit || 0)) * 5,
          hp: 100 + currentLevel * 20 + (prev.stats.vitality + (statBonuses?.vit || 0)) * 5,
          maxMp: 50 + currentLevel * 15 + (prev.stats.intelligence + (statBonuses?.int || 0)) * 4,
          mp: 50 + currentLevel * 15 + (prev.stats.intelligence + (statBonuses?.int || 0)) * 4,
          fatigue: 0,
          rank: newRank,
          title: newTitle,
          className: newClass,
        };

        if (leveledUp) {
          sounds.playLevelUp();
          setLevelUpData({ newLevel: currentLevel, points: 5 });
        }

        return {
          ...prev,
          stats: newStats,
        };
      });
    },
    []
  );

  // -------------------------------------------------------------
  // STAT ALLOCATION HANDLER
  // -------------------------------------------------------------
  const handleAllocateStat = (
    statName: keyof Pick<UserStats, 'strength' | 'agility' | 'vitality' | 'intelligence' | 'perception'>
  ) => {
    if (profile.stats.availableStatPoints <= 0) return;

    setProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        availableStatPoints: prev.stats.availableStatPoints - 1,
        [statName]: prev.stats[statName] + 1,
        maxHp: statName === 'vitality' ? prev.stats.maxHp + 5 : prev.stats.maxHp,
        maxMp: statName === 'intelligence' ? prev.stats.maxMp + 4 : prev.stats.maxMp,
      },
    }));
  };

  // -------------------------------------------------------------
  // PUZZLE & INVENTORY HANDLERS
  // -------------------------------------------------------------
  const handleCompletePuzzle = (puzzleId: string, intGain: number, xpGain: number) => {
    if (!completedPuzzles.includes(puzzleId)) {
      setCompletedPuzzles((prev) => [...prev, puzzleId]);
    }
    handleGainRewards(xpGain, { int: intGain, per: 1 });
  };

  const handleUseInventoryItem = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item || item.quantity <= 0) return;

    // Apply item effect
    setProfile((prev) => {
      let stats = { ...prev.stats };
      if (item.id === 'item_hp_potion') {
        stats.hp = stats.maxHp;
        stats.fatigue = 0;
      } else if (item.id === 'item_mp_elixir') {
        stats.mp = stats.maxMp;
      } else if (item.id === 'item_stat_scroll') {
        stats.availableStatPoints += 3;
      }
      return { ...prev, stats };
    });

    // Reduce inventory count
    setInventory((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, quantity: it.quantity - 1 } : it))
    );
  };

  const handleClearGate = (gateId: string, xpReward: number) => {
    setGates((prev) =>
      prev.map((g) => (g.id === gateId ? { ...g, cleared: true } : g))
    );
    handleGainRewards(xpReward, { str: 2, agi: 2, vit: 2 });
  };

  const handleRefreshAllData = () => {
    setProfile(Storage.getUserProfile());
    setHunterPlan(Storage.getHunterPlan());
    setInventory(Storage.getInventory());
    setGates(Storage.getGates());
    setCompletedPuzzles(Storage.getCompletedPuzzles());
  };

  // -------------------------------------------------------------
  // RENDER: NOT AUTHENTICATED
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  // -------------------------------------------------------------
  // MAIN APP WRAPPER
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_rgba(6,182,212,0.1)_0%,_rgba(2,6,23,0)_70%)] -z-10" />

      {/* Main Content Layout Container */}
      <div className={`w-full mx-auto flex-1 flex flex-col ${isMobileFrame ? 'max-w-md my-4 p-2 rounded-3xl border-4 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden bg-slate-950' : 'max-w-4xl'}`}>
        
        {/* App Header */}
        <Header
          profile={profile}
          soundEnabled={profile.soundEnabled ?? true}
          onToggleSound={() => setProfile((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
          onOpenStatus={() => setShowStatusWindow(true)}
          onOpenEditProfile={() => setShowEditProfile(true)}
          onOpenMorningReminder={() => setShowMorningReminder(true)}
          onOpenInventory={() => setShowInventory(true)}
          onOpenDungeon={() => setShowDungeon(true)}
          onOpenArchitecture={() => setShowArchitecture(true)}
          onOpenBackup={() => setShowBackup(true)}
          onInstallPwa={handleInstallPwa}
          canInstallPwa={!!deferredInstallPrompt && !isPwaInstalled}
        />

        {/* Track Banner & Mode Indicator */}
        <div className="px-3 sm:px-4 py-2.5">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
                profile.chosenTrack === 'HUNTER'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-950/40'
                  : 'bg-purple-950 text-purple-300 border-purple-500/50 shadow-md shadow-purple-950/40'
              }`}>
                {profile.chosenTrack === 'HUNTER' ? <Swords className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-slate-400">
                  ACTIVE ASCENSION TRACK
                </div>
                <h2 className="text-sm font-black font-orbitron text-white flex items-center gap-1.5">
                  {profile.chosenTrack === 'HUNTER' ? 'HUNTER TYPE (30-DAY FITNESS)' : 'MAZE TYPE (CHESS & LOGIC)'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { sounds.playStatAdd(); setShowEditProfile(true); }}
                className="hidden sm:inline-flex px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                Edit Profile
              </button>

              <button
                onClick={() => { sounds.playStatAdd(); setShowPathSelection(true); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
              >
                Switch ⇄
              </button>
            </div>
          </div>
        </div>

        {/* Primary View Router */}
        <main className="flex-1 px-3 sm:px-4 pb-6">
          {profile.chosenTrack === 'HUNTER' ? (
            <HunterTrackView
              hunterPlan={hunterPlan}
              onUpdatePlan={setHunterPlan}
              profile={profile}
              onRewardClaim={handleGainRewards}
              onSwitchTrack={() => setShowPathSelection(true)}
            />
          ) : (
            <MazeTrackView
              profile={profile}
              completedPuzzles={completedPuzzles}
              onCompletePuzzle={handleCompletePuzzle}
              onRewardClaim={handleGainRewards}
              onSwitchTrack={() => setShowPathSelection(true)}
            />
          )}
        </main>

        {/* Bottom Nav Bar */}
        <BottomNav
          currentTrack={profile.chosenTrack}
          onSelectTrack={handleSelectTrack}
          onOpenStatus={() => setShowStatusWindow(true)}
          onOpenMorningReminder={() => setShowMorningReminder(true)}
          onOpenEditProfile={() => setShowEditProfile(true)}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        />
      </div>

      {/* ----------------- MODAL OVERLAYS ----------------- */}

      {/* 1. Path Selection Awakening Modal */}
      {showPathSelection && (
        <PathSelectionModal
          currentTrack={profile.chosenTrack}
          onSelectTrack={handleSelectTrack}
          canCancel={!!profile.chosenTrack}
          onClose={() => setShowPathSelection(false)}
        />
      )}

      {/* 2. System Status Window Modal */}
      {showStatusWindow && (
        <StatusWindowModal
          profile={profile}
          onAllocateStat={handleAllocateStat}
          onOpenEditProfile={() => {
            setShowStatusWindow(false);
            setShowEditProfile(true);
          }}
          onOpenMorningReminder={() => {
            setShowStatusWindow(false);
            setShowMorningReminder(true);
          }}
          onClose={() => setShowStatusWindow(false)}
          onSwitchTrack={() => {
            setShowStatusWindow(false);
            setShowPathSelection(true);
          }}
        />
      )}

      {/* 3. Edit Hunter Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onSaveProfile={(updated) => {
            setProfile(updated);
          }}
          onOpenReminderSettings={() => {
            setShowEditProfile(false);
            setShowMorningReminder(true);
          }}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {/* 4. Morning Reminder Alarm Modal */}
      {showMorningReminder && (
        <MorningReminderModal
          profile={profile}
          onSaveReminder={(config) => {
            setProfile((prev) => ({ ...prev, morningReminder: config }));
          }}
          onClose={() => setShowMorningReminder(false)}
        />
      )}

      {/* 5. Inventory & Recovery Modal */}
      {showInventory && (
        <InventoryModal
          inventory={inventory}
          profile={profile}
          onUseItem={handleUseInventoryItem}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* 6. Dungeon Gate Boss Modal */}
      {showDungeon && (
        <DungeonGateModal
          gates={gates}
          profile={profile}
          onClearGate={handleClearGate}
          onClose={() => setShowDungeon(false)}
        />
      )}

      {/* 7. Mobile Architecture & Code Export Hub */}
      {showArchitecture && (
        <ArchitectureModal onClose={() => setShowArchitecture(false)} />
      )}

      {/* 8. Level Up Celebration Alert */}
      {levelUpData && (
        <LevelUpModal
          newLevel={levelUpData.newLevel}
          statPointsGained={levelUpData.points}
          onClose={() => {
            setLevelUpData(null);
            setShowStatusWindow(true);
          }}
        />
      )}

      {/* 9. Offline Backup & Restore Modal */}
      {showBackup && (
        <BackupModal
          onClose={() => setShowBackup(false)}
          onRefreshData={handleRefreshAllData}
        />
      )}
    </div>
  );
}
