import { PlayerStats, LeaderboardEntry, NeonThemeId } from './types';

const STATS_KEY = 'neon_blok_player_stats_v1';

export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  totalScore: 0,
  totalLinesCleared: 0,
  maxCombo: 0,
  campaignStars: {},
  unlockedLevel: 1,
  highScoreClassic: 0,
  dailyStreak: 0,
  lastDailyDate: '',
  dailyCompletedDates: [],
  unlockedThemes: ['cyber-cyan', 'synth-magenta'],
  activeTheme: 'cyber-cyan',
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STATS,
        ...parsed,
        campaignStars: parsed.campaignStars || {},
        dailyCompletedDates: parsed.dailyCompletedDates || [],
        unlockedThemes: parsed.unlockedThemes || ['cyber-cyan', 'synth-magenta'],
      };
    }
  } catch (e) {
    console.warn('Could not read player stats from localStorage', e);
  }
  return { ...DEFAULT_STATS };
}

export function savePlayerStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Could not save player stats to localStorage', e);
  }
}

// Seeded global leaderboard entries
export const SEEDED_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'V01D_WALKER', score: 48920, lines: 142, date: '2026-11-10', country: 'JP' },
  { rank: 2, name: 'NEON_VALKYRIE', score: 42150, lines: 126, date: '2026-11-11', country: 'SE' },
  { rank: 3, name: 'CYBER_KINETIC', score: 39800, lines: 119, date: '2026-11-09', country: 'US' },
  { rank: 4, name: 'GLITCH_HUNTER', score: 35400, lines: 104, date: '2026-11-11', country: 'KR' },
  { rank: 5, name: 'MATRIX_PULSE', score: 31200, lines: 92, date: '2026-11-08', country: 'DE' },
  { rank: 6, name: 'SYNTH_SHADOW', score: 28940, lines: 87, date: '2026-11-10', country: 'GB' },
  { rank: 7, name: 'BYTE_RUNNER', score: 25600, lines: 79, date: '2026-11-12', country: 'CA' },
  { rank: 8, name: 'CHRONO_CORE', score: 22100, lines: 68, date: '2026-11-07', country: 'FR' },
  { rank: 9, name: 'ZERO_GRAV', score: 19850, lines: 61, date: '2026-11-11', country: 'SG' },
  { rank: 10, name: 'AURA_DRIFT', score: 17400, lines: 54, date: '2026-11-12', country: 'BR' },
];

export function getMergedLeaderboard(playerHighScore: number, playerName = 'PLAYER_01'): LeaderboardEntry[] {
  const list = [...SEEDED_GLOBAL_LEADERBOARD];
  if (playerHighScore > 0) {
    list.push({
      rank: 0,
      name: playerName,
      score: playerHighScore,
      lines: Math.floor(playerHighScore / 300),
      date: new Date().toISOString().split('T')[0],
      country: 'LOCAL',
      isPlayer: true,
    });
  }

  // Sort descending by score
  list.sort((a, b) => b.score - a.score);

  // Re-assign ranks 1..N
  return list.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
