import { UserProfile, DailyHunterQuest, InventoryItem, DungeonGate, ChessPuzzle } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'solo_leveling_profile_v1',
  HUNTER_PLAN: 'solo_leveling_hunter_plan_v1',
  INVENTORY: 'solo_leveling_inventory_v1',
  GATES: 'solo_leveling_gates_v1',
  COMPLETED_PUZZLES: 'solo_leveling_puzzles_v1',
  SELECTED_DAY: 'solo_leveling_selected_day_v1',
};

// Initial default user state
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'hunter_001',
  name: 'Sung Jin-woo',
  nickname: 'Shadow Monarch',
  bio: 'The only Hunter in the world who can level up endlessly.',
  email: 'shadow.monarch@hunter-assoc.org',
  phone: '+1 (555) 789-0142',
  authMethod: 'GMAIL',
  avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
  chosenTrack: null, // User will choose in Awakening ceremony
  awakenedAt: new Date().toISOString(),
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  soundEnabled: true,
  morningReminder: {
    enabled: true,
    time: '07:00',
    notifyPushups: true,
    notifyMazeTactics: true,
    notifyPenaltyWarning: true,
    notifyMotivationalQuote: true,
    soundAlert: true,
    vibrationAlert: true,
    customMessage: 'The Daily Quest has arrived. Rise, Hunter!',
  },
  stats: {
    level: 1,
    xp: 0,
    maxXp: 100,
    availableStatPoints: 5,
    strength: 10,
    agility: 10,
    vitality: 10,
    intelligence: 10,
    perception: 10,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    fatigue: 0,
    rank: 'E-Rank',
    title: 'The Awakened',
    className: 'Shadow Sovereign (Candidate)',
  },
};

// 30-Day structured Hunter exercise generation (Day 1 to 30 with scaling intensity)
export function generate30DayHunterPlan(): DailyHunterQuest[] {
  const plan: DailyHunterQuest[] = [];

  for (let day = 1; day <= 30; day++) {
    // Dynamic scaling: standard solo leveling quest (100 pushups, 100 situps, 100 squats, 10km run)
    // Scaled realistically for progressive overload:
    // Days 1-7: Tier 1 (20-40 reps each + 2-4km)
    // Days 8-14: Tier 2 (50-70 reps each + 5-7km)
    // Days 15-21: Tier 3 (80-90 reps each + 8-9km)
    // Days 22-30: Tier 4 Sung Jin-woo Mode (100 reps each + 10km)
    
    let repMultiplier = Math.min(100, Math.round(25 + (day - 1) * 2.6));
    let kmDistance = Math.min(10, +(2 + (day - 1) * 0.28).toFixed(1));

    let title = `Day ${day}: `;
    let flavor = '';

    if (day === 1) {
      title += 'The System Awakening';
      flavor = '[DAILY QUEST HAS ARRIVED]\nComplete the assigned physical trial to prevent Penalty Zone teleportation.';
    } else if (day === 7) {
      title += 'Breakthrough: E to D Rank';
      flavor = 'Your muscle fibers are resonating with mana. First evaluation test.';
    } else if (day === 14) {
      title += 'Mana Conditioning: D to C Rank';
      flavor = 'Physical endurance increased. The System evaluates your vital capacity.';
    } else if (day === 21) {
      title += 'Shadow Vessel Awakening: C to A Rank';
      flavor = 'Approaching human limits. Your agility and speed transcend normal physiology.';
    } else if (day === 30) {
      title += 'Final Evolution: S-Rank Monarch Ascent';
      flavor = 'The final requirement of the 30-day program. Claim the Monarch’s Crown.';
    } else {
      title += 'Daily Physical Evolution';
      flavor = `Preparing to become strong. Day ${day} quota assigned by the System.`;
    }

    plan.push({
      dayNumber: day,
      title,
      flavorText: flavor,
      isCompleted: false,
      penaltySecondsLeft: 14400, // 4 hours countdown simulation
      exercises: [
        {
          id: `ex_pushups_d${day}`,
          name: 'Push-ups',
          targetCount: repMultiplier,
          unit: 'reps',
          completedCount: 0,
          iconName: 'Dumbbell',
          xpReward: 30,
          statReward: 'strength',
          instruction: 'Keep spine neutral, chest touching floor, explosive push.'
        },
        {
          id: `ex_situps_d${day}`,
          name: 'Sit-ups',
          targetCount: repMultiplier,
          unit: 'reps',
          completedCount: 0,
          iconName: 'Activity',
          xpReward: 25,
          statReward: 'vitality',
          instruction: 'Engage core, do not pull neck, full flexion.'
        },
        {
          id: `ex_squats_d${day}`,
          name: 'Squats',
          targetCount: repMultiplier,
          unit: 'reps',
          completedCount: 0,
          iconName: 'Zap',
          xpReward: 30,
          statReward: 'agility',
          instruction: 'Feet shoulder-width apart, knees tracking over toes, below parallel.'
        },
        {
          id: `ex_running_d${day}`,
          name: 'Running / Sprint',
          targetCount: kmDistance,
          unit: 'km',
          completedCount: 0,
          iconName: 'Flame',
          xpReward: 40,
          statReward: 'vitality',
          instruction: 'Steady aerobic pace or interval sprints outdoors/treadmill.'
        }
      ]
    });
  }

  return plan;
}

// Built-in Chess Tactical Puzzles (Solvable with clear tactics)
export const DEFAULT_CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: 'puzzle_1',
    title: 'Trial 1: Scholar’s Fatal Strike (Mate in 1)',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    solutionMoves: ['Qxf7#', 'f3f7'],
    turn: 'w',
    difficulty: 'E-Rank',
    hint: 'Queen attacks the vulnerable f7 square protected by the bishop on c4.',
    description: 'A swift tactical checkmate targeting the weakest square in the opponent defense.',
    xpReward: 50,
    intReward: 2
  },
  {
    id: 'puzzle_2',
    title: 'Trial 2: Smothered Monarch Checkmate (Mate in 1)',
    fen: '6k1/5ppp/8/8/8/5N2/5PPP/4Q1K1 w - - 0 1',
    solutionMoves: ['Qe8#', 'e1e8'],
    turn: 'w',
    difficulty: 'E-Rank',
    hint: 'Back rank weakness. Infiltrate with the Queen to the 8th rank.',
    description: 'The enemy king is trapped behind its own shield of pawns.',
    xpReward: 60,
    intReward: 3
  },
  {
    id: 'puzzle_3',
    title: 'Trial 3: Shadow Knight Royal Fork',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 0 1',
    solutionMoves: ['Nxe5', 'f3e5'],
    turn: 'w',
    difficulty: 'C-Rank',
    hint: 'Central capture unpins the position and initiates tactical advantage.',
    description: 'Sacrifice and center control reveal hidden tactical lines.',
    xpReward: 80,
    intReward: 4
  },
  {
    id: 'puzzle_4',
    title: 'Trial 4: Operatic Discovered Check (Mate in 1)',
    fen: 'rn2kb1r/pp3ppp/2p1p3/8/3q4/3B1Q1P/PPP2PP1/R1B1K2R w KQkq - 0 1',
    solutionMoves: ['Bxf7+', 'd3f7'],
    turn: 'w',
    difficulty: 'C-Rank',
    hint: 'Bishop strike on f7 breaks the king’s guard.',
    description: 'Puncture through the enemy defensive wall.',
    xpReward: 90,
    intReward: 4
  },
  {
    id: 'puzzle_5',
    title: 'Trial 5: Sovereign Anastasias Mate',
    fen: '5rk1/1p3ppp/8/8/8/4Q3/5PPP/R5K1 w - - 0 1',
    solutionMoves: ['Qe7', 'e3e7'],
    turn: 'w',
    difficulty: 'A-Rank',
    hint: 'Dominate the 7th rank to restrict the king and rook.',
    description: 'Pigs on the seventh rank choke out all counterplay.',
    xpReward: 120,
    intReward: 6
  }
];

export const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 'item_hp_potion',
    name: 'Full Recovery Elixir',
    type: 'POTION',
    description: 'Instantly recovers 100% of physical HP and restores fatigue to 0.',
    rarity: 'Epic',
    quantity: 3,
    icon: 'Heart',
    effectText: '+100% HP, Fatigue Reset'
  },
  {
    id: 'item_mp_elixir',
    name: 'Essence of Mana Potion',
    type: 'POTION',
    description: 'Restores 100 MP and increases cognitive focus for puzzle solving.',
    rarity: 'Rare',
    quantity: 5,
    icon: 'Sparkles',
    effectText: '+100 MP'
  },
  {
    id: 'item_dungeon_key',
    name: 'Instant Dungeon Key (E-Rank)',
    type: 'KEY',
    description: 'A mysterious black key that opens a solitary gate in the subway station.',
    rarity: 'Common',
    quantity: 2,
    icon: 'Key',
    effectText: 'Unlocks Boss Chamber'
  },
  {
    id: 'item_stat_scroll',
    name: 'Ruler’s Authority Rune',
    type: 'SCROLL',
    description: 'An ancient inscription granting +3 free attribute points.',
    rarity: 'Legendary',
    quantity: 1,
    icon: 'Scroll',
    effectText: '+3 Unallocated Stat Points'
  }
];

export const DEFAULT_GATES: DungeonGate[] = [
  {
    id: 'gate_e1',
    name: 'Subway Station Dungeon',
    rank: 'E-Rank',
    type: 'BLUE_GATE',
    requiredLevel: 1,
    bossName: 'Blue Poison-Fanged Razaka',
    bossHp: 250,
    rewardsDescription: '+150 XP, Rasaka’s Fang Dagger, +2 Strength',
    cleared: false
  },
  {
    id: 'gate_d1',
    name: 'Insect Queen’s Nest',
    rank: 'D-Rank',
    type: 'BLUE_GATE',
    requiredLevel: 5,
    bossName: 'Giant Centipede Sovereign',
    bossHp: 600,
    rewardsDescription: '+350 XP, 2x Recovery Potions, +3 Agility',
    cleared: false
  },
  {
    id: 'gate_c1',
    name: 'Demon Castle: Lower Floors',
    rank: 'C-Rank',
    type: 'RED_GATE',
    requiredLevel: 12,
    bossName: 'Vulcan of Avarice',
    bossHp: 1800,
    rewardsDescription: '+800 XP, Orb of Avarice, +5 All Stats',
    cleared: false
  },
  {
    id: 'gate_s1',
    name: 'Jeju Island Ant Queen Cave',
    rank: 'S-Rank',
    type: 'RED_GATE',
    requiredLevel: 25,
    bossName: 'Ant King (Beru)',
    bossHp: 5000,
    rewardsDescription: '+2500 XP, Shadow Extraction: Beru, Title: Shadow Monarch',
    cleared: false
  }
];

// Offline Storage helper methods
export const Storage = {
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_USER_PROFILE,
          ...parsed,
          morningReminder: {
            ...DEFAULT_USER_PROFILE.morningReminder,
            ...(parsed.morningReminder || {}),
          },
          stats: {
            ...DEFAULT_USER_PROFILE.stats,
            ...(parsed.stats || {}),
          },
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_USER_PROFILE;
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  },

  getHunterPlan(): DailyHunterQuest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HUNTER_PLAN);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    const fresh = generate30DayHunterPlan();
    this.saveHunterPlan(fresh);
    return fresh;
  },

  saveHunterPlan(plan: DailyHunterQuest[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HUNTER_PLAN, JSON.stringify(plan));
    } catch {
      // ignore
    }
  },

  getInventory(): InventoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return DEFAULT_INVENTORY;
  },

  saveInventory(inv: InventoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inv));
    } catch {
      // ignore
    }
  },

  getGates(): DungeonGate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GATES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return DEFAULT_GATES;
  },

  saveGates(gates: DungeonGate[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GATES, JSON.stringify(gates));
    } catch {
      // ignore
    }
  },

  getCompletedPuzzles(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_PUZZLES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [];
  },

  saveCompletedPuzzles(puzzles: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_PUZZLES, JSON.stringify(puzzles));
    } catch {
      // ignore
    }
  },

  exportFullBackup(): string {
    const backup = {
      profile: this.getUserProfile(),
      hunterPlan: this.getHunterPlan(),
      inventory: this.getInventory(),
      gates: this.getGates(),
      completedPuzzles: this.getCompletedPuzzles(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) this.saveUserProfile(parsed.profile);
      if (parsed.hunterPlan) this.saveHunterPlan(parsed.hunterPlan);
      if (parsed.inventory) this.saveInventory(parsed.inventory);
      if (parsed.gates) this.saveGates(parsed.gates);
      if (parsed.completedPuzzles) this.saveCompletedPuzzles(parsed.completedPuzzles);
      return true;
    } catch {
      return false;
    }
  },

  resetAllData(): void {
    localStorage.clear();
  }
};
