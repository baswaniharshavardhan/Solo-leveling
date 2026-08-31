export const ARCHITECTURE_DATA = {
  overview: {
    appName: "Solo Leveling: Awakening System",
    architecturePattern: "Offline-First Mobile Architecture (Clean Architecture / MVVM)",
    primaryTechStacks: ["React Native (Expo + TypeScript)", "Flutter (Dart + Riverpod)"],
    persistenceEngines: ["SQLite (expo-sqlite / sqflite)", "WatermelonDB / Hive", "Encrypted MMKV / SecureStorage"]
  },
  
  databaseSchema: `
-- ==========================================================
-- SOLO LEVELING: OFFLINE SQLITE / WATERMELON SCHEMA (v1.0)
-- ==========================================================

-- 1. User Profile & Core System Attributes
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  auth_provider TEXT CHECK(auth_provider IN ('GMAIL', 'FACEBOOK', 'PHONE')),
  chosen_track TEXT CHECK(chosen_track IN ('HUNTER', 'MAZE', NULL)),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  max_xp INTEGER DEFAULT 100,
  available_stat_points INTEGER DEFAULT 5,
  strength INTEGER DEFAULT 10,
  agility INTEGER DEFAULT 10,
  vitality INTEGER DEFAULT 10,
  intelligence INTEGER DEFAULT 10,
  perception INTEGER DEFAULT 10,
  hp INTEGER DEFAULT 100,
  max_hp INTEGER DEFAULT 100,
  mp INTEGER DEFAULT 50,
  max_mp INTEGER DEFAULT 50,
  fatigue INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'E-Rank',
  title TEXT DEFAULT 'The Awakened',
  streak_days INTEGER DEFAULT 1,
  last_active_date TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hunter Track: 30-Day Physical Quests
CREATE TABLE IF NOT EXISTS hunter_daily_quests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  day_number INTEGER NOT NULL, -- 1 to 30
  title TEXT NOT NULL,
  flavor_text TEXT,
  is_completed INTEGER DEFAULT 0, -- boolean
  completed_at TIMESTAMP,
  penalty_seconds_left INTEGER DEFAULT 14400,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Exercise Item Logs per Quest
CREATE TABLE IF NOT EXISTS hunter_exercise_logs (
  id TEXT PRIMARY KEY,
  quest_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL, -- 'Push-ups', 'Sit-ups', 'Squats', 'Running'
  target_count REAL NOT NULL,
  unit TEXT NOT NULL,          -- 'reps' or 'km'
  completed_count REAL DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  stat_reward TEXT NOT NULL,   -- 'strength', 'agility', 'vitality'
  FOREIGN KEY (quest_id) REFERENCES hunter_daily_quests(id) ON DELETE CASCADE
);

-- 4. Maze Track: Cognitive Trial History & Puzzles
CREATE TABLE IF NOT EXISTS maze_puzzle_completions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  puzzle_id TEXT NOT NULL,
  puzzle_type TEXT NOT NULL,   -- 'CHESS_TACTICS', 'MEMORY_RUNES', 'SLIDING_GLYPH', 'MANA_CIRCUIT'
  difficulty TEXT NOT NULL,    -- 'E-Rank', 'C-Rank', 'A-Rank', 'S-Rank'
  moves_taken INTEGER,
  time_seconds INTEGER,
  int_gained INTEGER,
  per_gained INTEGER,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Inventory & System Recovery Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  item_type TEXT CHECK(item_type IN ('POTION', 'KEY', 'SCROLL', 'ARTIFACT')),
  rarity TEXT CHECK(rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
  quantity INTEGER DEFAULT 1,
  effect_text TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`,

  uiScreensAndUserFlow: [
    {
      step: 1,
      name: "Authentication Screen (3 Providers)",
      description: "Supports Google Sign-in / Email+Password, Facebook credentials, and Phone Number + 6-digit SMS OTP verification. Allows instant offline guest mode or account registration.",
      next: "Awakening Path Selection (if first time) OR Dashboard"
    },
    {
      step: 2,
      name: "Awakening Ceremony (Track Selection)",
      description: "Dramatic Solo Leveling system popup: Choose between 'Hunter Type' (30-day physical training) and 'Maze Type' (Tactical chess and logic puzzles). Both tracks earn XP and Level-ups.",
      next: "Hunter View or Maze View with System Status Window"
    },
    {
      step: 3,
      name: "Primary Hub & System Status Window",
      description: "Holographic floating HUD displaying Level, Rank (E->S), HP/MP, Fatigue, and attribute points (STR, AGI, VIT, INT, PER). Tap attributes to distribute stat points dynamically.",
      next: "Daily Quest Engine / Dungeon Gates / Inventory"
    },
    {
      step: 4,
      name: "Hunter Track View (30-Day Evolution Plan)",
      description: "Interactive calendar grid (Days 1 to 30). Daily Quest: 100 pushups, 100 situps, 100 squats, 10km run (scaled with smart intensity tiers). Includes interactive rep counter, set timer, rest timer, and penalty countdown.",
      next: "Quest Reward Claim -> Level Up Celebration"
    },
    {
      step: 5,
      name: "Maze Track View (Chess & Logic Puzzles)",
      description: "Full offline Chess engine (Play vs AI Monarchs with 4 difficulties) + Daily Mate-in-1/2 tactical puzzles + 4 cognitive mini-games (Runic Memory, Sliding Shadow Glyph, Mana Circuit, Knight's Dungeon).",
      next: "INT/PER Stat Gains -> Cognitive Rank Evolution"
    },
    {
      step: 6,
      name: "Dungeon Gate & Boss Lairs",
      description: "Subway Station E-Rank -> Jeju Island S-Rank raid encounters. Unlocks boss battles based on hunter level and quest completion.",
      next: "Legendary Artifacts & Inventory Rewards"
    }
  ],

  reactNativeStarterCode: `// ============================================================================
// REACT NATIVE / EXPO STARTER CODE (Solo Leveling: Awakening System)
// Dependencies: @react-navigation/native, expo-router, zustand, @react-native-async-storage/async-storage
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, StatusBar, Alert, ScrollView, Animated 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// ----------------------------------------------------------------------------
// 1. ZUSTAND GLOBAL STATE STORE (Offline-First)
// ----------------------------------------------------------------------------
interface UserState {
  isLoggedIn: boolean;
  chosenTrack: 'HUNTER' | 'MAZE' | null;
  level: number;
  xp: number;
  statPoints: number;
  stats: { str: number; agi: number; vit: number; int: number; per: number };
  login: (method: 'GMAIL' | 'FACEBOOK' | 'PHONE', identifier: string) => Promise<void>;
  selectTrack: (track: 'HUNTER' | 'MAZE') => Promise<void>;
  addStatPoint: (stat: 'str' | 'agi' | 'vit' | 'int' | 'per') => void;
  loadLocalData: () => Promise<void>;
}

export const useHunterStore = create<UserState>((set, get) => ({
  isLoggedIn: false,
  chosenTrack: null,
  level: 1,
  xp: 0,
  statPoints: 5,
  stats: { str: 10, agi: 10, vit: 10, int: 10, per: 10 },

  login: async (method, identifier) => {
    const newState = { isLoggedIn: true };
    await AsyncStorage.setItem('SOLO_AUTH', JSON.stringify({ method, identifier, timestamp: Date.now() }));
    set(newState);
  },

  selectTrack: async (track) => {
    await AsyncStorage.setItem('SOLO_TRACK', track);
    set({ chosenTrack: track });
  },

  addStatPoint: (stat) => {
    const { statPoints, stats } = get();
    if (statPoints <= 0) return;
    set({
      statPoints: statPoints - 1,
      stats: { ...stats, [stat]: stats[stat] + 1 }
    });
  },

  loadLocalData: async () => {
    const auth = await AsyncStorage.getItem('SOLO_AUTH');
    const track = await AsyncStorage.getItem('SOLO_TRACK');
    if (auth) {
      set({ isLoggedIn: true, chosenTrack: (track as any) || null });
    }
  }
}));

// ----------------------------------------------------------------------------
// 2. AUTHENTICATION SCREEN COMPONENT
// ----------------------------------------------------------------------------
export function AuthScreen() {
  const { login } = useHunterStore();
  const [tab, setTab] = useState<'GMAIL' | 'FACEBOOK' | 'PHONE'>('GMAIL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleAuth = () => {
    if (tab === 'PHONE') {
      if (!otpSent) {
        if (!phone) return Alert.alert('System Alert', 'Please enter valid phone number');
        setOtpSent(true);
        Alert.alert('System Notice', 'Verification Code [774921] sent via SMS.');
        return;
      }
      if (otp === '774921' || otp.length === 6) {
        login('PHONE', phone);
      } else {
        Alert.alert('Verification Failed', 'Invalid OTP code.');
      }
    } else if (tab === 'GMAIL') {
      if (!email || !password) return Alert.alert('System Alert', 'Please fill credentials');
      login('GMAIL', email);
    } else {
      login('FACEBOOK', 'fb_user_authenticated');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowBox}>
        <Text style={styles.systemTitle}>[ SYSTEM NOTIFICATION ]</Text>
        <Text style={styles.systemSubtitle}>PLAYER AUTHENTICATION GATE</Text>

        {/* Tab Selector */}
        <View style={styles.tabRow}>
          {(['GMAIL', 'FACEBOOK', 'PHONE'] as const).map((item) => (
            <TouchableOpacity 
              key={item} 
              onPress={() => { setTab(item); setOtpSent(false); }}
              style={[styles.tabBtn, tab === item && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form Body */}
        {tab === 'GMAIL' && (
          <View style={styles.formContainer}>
            <TextInput 
              placeholder="Hunter Email (e.g. jinwoo@monarch.com)" 
              placeholderTextColor="#64748b" 
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput 
              placeholder="Mana Security Password" 
              placeholderTextColor="#64748b" 
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>
        )}

        {tab === 'FACEBOOK' && (
          <View style={styles.formContainer}>
            <Text style={styles.infoText}>Connect with Facebook Hunter Federation ID</Text>
            <TextInput 
              placeholder="FB Credentials / OAuth Token" 
              placeholderTextColor="#64748b" 
              style={styles.input}
            />
          </View>
        )}

        {tab === 'PHONE' && (
          <View style={styles.formContainer}>
            <TextInput 
              placeholder="+1 (555) 000-0000" 
              placeholderTextColor="#64748b" 
              keyboardType="phone-pad"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
            />
            {otpSent && (
              <TextInput 
                placeholder="Enter 6-digit OTP (Code: 774921)" 
                placeholderTextColor="#64748b" 
                keyboardType="numeric"
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={setOtp}
              />
            )}
          </View>
        )}

        <TouchableOpacity style={styles.actionBtn} onPress={handleAuth}>
          <Text style={styles.actionBtnText}>
            {tab === 'PHONE' && !otpSent ? 'TRANSMIT OTP CODE' : 'AWAKEN PLAYER PROFILE'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------------
// 3. TRACK SELECTION & STATUS WINDOW
// ----------------------------------------------------------------------------
export function TrackSelectionScreen() {
  const { selectTrack } = useHunterStore();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.systemTitle}>[ AWAKENING CEREMONY ]</Text>
      <Text style={styles.systemSubtitle}>SELECT YOUR ASCENSION PATHWAY</Text>

      <TouchableOpacity 
        style={[styles.trackCard, styles.hunterCard]} 
        onPress={() => selectTrack('HUNTER')}
      >
        <Text style={styles.trackTitle}>⚔️ HUNTER TYPE</Text>
        <Text style={styles.trackDesc}>
          30-Day Structured Physical Quest. 100 Push-ups, 100 Sit-ups, 100 Squats, 10km Run.
          Overcome physical limits to awaken the Monarch Vessel.
        </Text>
        <Text style={styles.affinity}>Primary Affinities: STR, AGI, VIT</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.trackCard, styles.mazeCard]} 
        onPress={() => selectTrack('MAZE')}
      >
        <Text style={styles.trackTitle}>♟️ MAZE TYPE</Text>
        <Text style={styles.trackDesc}>
          Tactical Chess Trials & Runic Logic Chambers.
          Solve complex positional gambits and memory conduits to expand mana reserve.
        </Text>
        <Text style={styles.affinity}>Primary Affinities: INT, PER, MP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 20, justifyContent: 'center' },
  glowBox: { backgroundColor: '#090d16', borderColor: '#06b6d4', borderWidth: 1, padding: 24, borderRadius: 12 },
  systemTitle: { color: '#06b6d4', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, textAlign: 'center' },
  systemSubtitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', textAlign: 'center', marginVertical: 8 },
  tabRow: { flexDirection: 'row', gap: 8, marginVertical: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 6, backgroundColor: '#0f172a', alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#0891b2' },
  tabText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  tabTextActive: { color: '#ffffff' },
  formContainer: { marginVertical: 12 },
  input: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, color: '#fff', borderRadius: 8, padding: 14, marginBottom: 12 },
  otpInput: { borderColor: '#06b6d4', letterSpacing: 4, textAlign: 'center', fontSize: 16 },
  actionBtn: { backgroundColor: '#06b6d4', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  actionBtnText: { color: '#020617', fontWeight: '900', letterSpacing: 1 },
  infoText: { color: '#94a3b8', fontSize: 12, marginBottom: 10, textAlign: 'center' },
  trackCard: { padding: 20, borderRadius: 12, borderWidth: 1, marginVertical: 10 },
  hunterCard: { backgroundColor: '#0c1a2e', borderColor: '#0ea5e9' },
  mazeCard: { backgroundColor: '#1e112a', borderColor: '#a855f7' },
  trackTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  trackDesc: { color: '#cbd5e1', fontSize: 13, lineHeight: 20 },
  affinity: { color: '#38bdf8', fontSize: 12, marginTop: 10, fontWeight: '700' }
});
`,

  flutterStarterCode: `// ============================================================================
// FLUTTER STARTER CODE (Solo Leveling: Awakening System)
// Dependencies: flutter_riverpod, go_router, shared_preferences / hive_flutter
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  runApp(const ProviderScope(child: SoloLevelingApp()));
}

// ----------------------------------------------------------------------------
// 1. RIVERPOD STATE MANAGEMENT & MODELS
// ----------------------------------------------------------------------------
enum TrackType { hunter, maze }

class UserStats {
  final int level;
  final int xp;
  final int statPoints;
  final int strength;
  final int agility;
  final int vitality;
  final int intelligence;
  final int perception;

  UserStats({
    this.level = 1,
    this.xp = 0,
    this.statPoints = 5,
    this.strength = 10,
    this.agility = 10,
    this.vitality = 10,
    this.intelligence = 10,
    this.perception = 10,
  });

  UserStats copyWith({
    int? level,
    int? xp,
    int? statPoints,
    int? strength,
    int? agility,
    int? vitality,
    int? intelligence,
    int? perception,
  }) {
    return UserStats(
      level: level ?? this.level,
      xp: xp ?? this.xp,
      statPoints: statPoints ?? this.statPoints,
      strength: strength ?? this.strength,
      agility: agility ?? this.agility,
      vitality: vitality ?? this.vitality,
      intelligence: intelligence ?? this.intelligence,
      perception: perception ?? this.perception,
    );
  }
}

class UserProfileNotifier extends StateNotifier<AsyncValue<UserStats>> {
  UserProfileNotifier() : super(AsyncValue.data(UserStats()));

  void allocateStat(String statName) {
    state.whenData((stats) {
      if (stats.statPoints <= 0) return;
      if (statName == 'STR') {
        state = AsyncValue.data(stats.copyWith(strength: stats.strength + 1, statPoints: stats.statPoints - 1));
      } else if (statName == 'INT') {
        state = AsyncValue.data(stats.copyWith(intelligence: stats.intelligence + 1, statPoints: stats.statPoints - 1));
      }
      // Persist to SharedPreferences / Hive locally
    });
  }
}

final userStatsProvider = StateNotifierProvider<UserProfileNotifier, AsyncValue<UserStats>>((ref) {
  return UserProfileNotifier();
});

// ----------------------------------------------------------------------------
// 2. MAIN FLUTTER APPLICATION & THEME
// ----------------------------------------------------------------------------
class SoloLevelingApp extends StatelessWidget {
  const SoloLevelingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Solo Leveling: Awakening',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF030712),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF06B6D4), // Cyan Glow
          secondary: Color(0xFFA855F7), // Shadow Purple
          surface: Color(0xFF090D16),
        ),
      ),
      home: const AuthScreen(),
    );
  }
}

// ----------------------------------------------------------------------------
// 3. AUTHENTICATION & PHONE OTP SCREEN
// ----------------------------------------------------------------------------
class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  int _selectedTab = 0; // 0: Gmail, 1: Facebook, 2: Phone
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _otpSent = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: const Color(0xFF090D16),
              borderRadius: BorderRadius.circular(16.0),
              border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.5), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF06B6D4).withOpacity(0.2),
                  blurRadius: 20,
                  spreadRadius: 2,
                )
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  '[ SYSTEM NOTIFICATION ]',
                  style: TextStyle(color: Color(0xFF06B6D4), fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 13),
                ),
                const SizedBox(height: 6),
                const Text(
                  'PLAYER AUTHENTICATION',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20),
                ),
                const SizedBox(height: 20),

                // Method Segment
                Row(
                  children: [
                    _buildTab(0, 'Gmail'),
                    const SizedBox(width: 8),
                    _buildTab(1, 'Facebook'),
                    const SizedBox(width: 8),
                    _buildTab(2, 'Phone OTP'),
                  ],
                ),
                const SizedBox(height: 20),

                if (_selectedTab == 2) ...[
                  TextField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      hintText: '+1 (555) 000-0000',
                      filled: true,
                      fillColor: Color(0xFF0F172A),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (_otpSent)
                    TextField(
                      controller: _otpController,
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      style: const TextStyle(letterSpacing: 4, fontWeight: FontWeight.bold),
                      decoration: const InputDecoration(
                        hintText: 'Enter 6-digit Code (774921)',
                        filled: true,
                        fillColor: Color(0xFF0F172A),
                        border: OutlineInputBorder(),
                      ),
                    ),
                ] else ...[
                  const TextField(
                    decoration: InputDecoration(
                      hintText: 'Identifier / Email',
                      filled: true,
                      fillColor: Color(0xFF0F172A),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const TextField(
                    obscureText: true,
                    decoration: InputDecoration(
                      hintText: 'Security Password',
                      filled: true,
                      fillColor: Color(0xFF0F172A),
                      border: OutlineInputBorder(),
                    ),
                  ),
                ],
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF06B6D4),
                      foregroundColor: const Color(0xFF020617),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () {
                      if (_selectedTab == 2 && !_otpSent) {
                        setState(() => _otpSent = true);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('[System Alert] OTP code 774921 sent.')),
                        );
                      } else {
                        // Navigate to Track Selection / Dashboard
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const TrackSelectionScreen()));
                      }
                    },
                    child: Text(
                      _selectedTab == 2 && !_otpSent ? 'TRANSMIT OTP CODE' : 'AWAKEN PLAYER',
                      style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5),
                    ),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTab(int index, String label) {
    final isSelected = _selectedTab == index;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() {
          _selectedTab = index;
          _otpSent = false;
        }),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF06B6D4) : const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(6),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.black : Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}

class TrackSelectionScreen extends StatelessWidget {
  const TrackSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('PATHWAY SELECTION')),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            const Text(
              '[ THE SYSTEM OFFERS TWO ASCENSION PATHS ]',
              style: TextStyle(color: Color(0xFF06B6D4), fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            _pathCard(
              context,
              title: '⚔️ HUNTER TYPE',
              desc: '30-Day progressive physical quest (Pushups, Situps, Squats, Running). Daily penalty zone countdown.',
              color: const Color(0xFF0C1A2E),
              borderColor: const Color(0xFF0EA5E9),
            ),
            const SizedBox(height: 16),
            _pathCard(
              context,
              title: '♟️ MAZE TYPE',
              desc: 'Tactical Chess battles against AI Monarchs, mate-in-1/2 trials, and runic memory logic puzzles.',
              color: const Color(0xFF1E112A),
              borderColor: const Color(0xFFA855F7),
            ),
          ],
        ),
      ),
    );
  }

  Widget _pathCard(BuildContext context, {required String title, required String desc, required Color color, required Color borderColor}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 8),
          Text(desc, style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4)),
        ],
      ),
    );
  }
}
`
};
