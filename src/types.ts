export type TrackType = 'HUNTER' | 'MAZE';

export type HunterRank = 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank' | 'National-Level';

export type AuthMethod = 'GMAIL' | 'FACEBOOK' | 'PHONE';

export interface UserStats {
  level: number;
  xp: number;
  maxXp: number;
  availableStatPoints: number;
  strength: number;    // STR (Hunter primary)
  agility: number;     // AGI
  vitality: number;    // VIT
  intelligence: number;// INT (Maze primary)
  perception: number;  // PER
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  fatigue: number;     // 0 to 100
  rank: HunterRank;
  title: string;
  className: string;
}

export interface MorningReminderConfig {
  enabled: boolean;
  time: string; // e.g. "06:30"
  notifyPushups: boolean;
  notifyMazeTactics: boolean;
  notifyPenaltyWarning: boolean;
  notifyMotivationalQuote: boolean;
  soundAlert: boolean;
  vibrationAlert: boolean;
  customMessage?: string;
  lastTriggeredDate?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  nickname?: string;
  bio?: string;
  className?: string;
  email?: string;
  phone?: string;
  authMethod: AuthMethod;
  avatarUrl: string;
  chosenTrack: TrackType | null;
  awakenedAt: string;
  stats: UserStats;
  streakDays: number;
  lastActiveDate: string;
  soundEnabled: boolean;
  morningReminder: MorningReminderConfig;
}

export interface ExerciseItem {
  id: string;
  name: string;
  targetCount: number;
  unit: string;
  completedCount: number;
  iconName: string;
  xpReward: number;
  statReward: 'strength' | 'agility' | 'vitality';
  instruction: string;
}

export interface DailyHunterQuest {
  dayNumber: number;
  title: string;
  flavorText: string;
  isCompleted: boolean;
  completedAt?: string;
  penaltySecondsLeft: number;
  exercises: ExerciseItem[];
}

export interface ChessPuzzle {
  id: string;
  title: string;
  fen: string;
  solutionMoves: string[]; // e.g. ["e2e4", "e7e5"] or standard SAN ["Qxf7#"]
  turn: 'w' | 'b';
  difficulty: 'E-Rank' | 'C-Rank' | 'A-Rank' | 'S-Rank';
  hint: string;
  description: string;
  xpReward: number;
  intReward: number;
}

export type LogicPuzzleType = 
  | 'MEMORY_RUNES' 
  | 'SLIDING_GLYPH' 
  | 'MANA_CIRCUIT' 
  | 'KNIGHT_MAZE' 
  | 'RUNIC_CIPHER' 
  | 'TOWER_OF_MONARCHS';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'POTION' | 'KEY' | 'SCROLL' | 'ARTIFACT';
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  quantity: number;
  icon: string;
  effectText: string;
}

export interface DungeonGate {
  id: string;
  name: string;
  rank: HunterRank;
  type: 'RED_GATE' | 'BLUE_GATE' | 'BOSS_LAIR';
  requiredLevel: number;
  bossName: string;
  bossHp: number;
  rewardsDescription: string;
  cleared: boolean;
}
