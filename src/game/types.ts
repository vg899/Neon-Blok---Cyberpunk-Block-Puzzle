/**
 * Core type definitions for Neon Blok
 */

export type NeonThemeId = 'cyber-cyan' | 'synth-magenta' | 'matrix-emerald' | 'solar-amber' | 'void-violet';

export interface NeonTheme {
  id: NeonThemeId;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  bgRgba: string;
}

export type CellType = 
  | 'empty'
  | 'filled'
  | 'obstacle'    // immovable obstacle (cleared only when line is full)
  | 'bomb'        // bomb/countdown block (must clear in N moves)
  | 'glitch';      // multiplayer penalty block

export interface GridCell {
  type: CellType;
  color?: string;     // Hex code or theme color
  countdown?: number; // For bombs: moves remaining before detonation
  id?: string;        // For animation tracking
}

export type Grid = GridCell[][];

export interface PieceShape {
  id: string;
  name: string;
  matrix: number[][]; // 1 for filled, 0 for empty
  color: string;
  rarity?: 'common' | 'uncommon' | 'rare';
}

export type GameMode = 'classic' | 'campaign' | 'daily' | 'multiplayer';

export interface LevelConfig {
  level: number;
  name: string;
  gridSize: number;       // default 8
  targetScore: number;
  moveLimit?: number;     // optional move limit
  targetLines?: number;   // optional line clear goal
  initialObstacles?: { x: number; y: number }[];
  initialBombs?: { x: number; y: number; turns: number }[];
  voidCells?: { x: number; y: number }[]; // non-playable holes
  starsThresholds: [number, number, number]; // Score needed for 1, 2, 3 stars
  description: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  totalScore: number;
  totalLinesCleared: number;
  maxCombo: number;
  campaignStars: Record<number, number>; // level -> stars (1-3)
  unlockedLevel: number;
  highScoreClassic: number;
  dailyStreak: number;
  lastDailyDate: string;
  dailyCompletedDates: string[];
  unlockedThemes: NeonThemeId[];
  activeTheme: NeonThemeId;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  lines: number;
  date: string;
  country: string;
  isPlayer?: boolean;
}

export interface SyncPayload {
  version: number;
  timestamp: number;
  stats: PlayerStats;
  checksum: string;
}
