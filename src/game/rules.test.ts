import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptyGrid,
  canPlacePiece,
  placePiece,
  checkCompletedLines,
  clearLines,
  calculateScore,
  hasAnyValidMove,
  encodeSyncData,
  decodeSyncData,
  getCampaignLevels,
} from './rules';
import { RAW_PIECES } from './pieces';
import { PlayerStats } from './types';

test('createEmptyGrid creates correct dimensions and empty cells', () => {
  const grid = createEmptyGrid(8, 8);
  assert.equal(grid.length, 8);
  assert.equal(grid[0].length, 8);
  assert.equal(grid[0][0].type, 'empty');
  assert.equal(grid[7][7].type, 'empty');
});

test('canPlacePiece validates boundaries and collisions', () => {
  const grid = createEmptyGrid(8, 8);
  const square2x2 = [[1, 1], [1, 1]];

  // Legal placements
  assert.equal(canPlacePiece(grid, square2x2, 0, 0), true);
  assert.equal(canPlacePiece(grid, square2x2, 6, 6), true);

  // Out of bounds
  assert.equal(canPlacePiece(grid, square2x2, 7, 7), false);
  assert.equal(canPlacePiece(grid, square2x2, -1, 0), false);

  // Collision
  grid[0][0] = { type: 'filled', color: '#00f0ff' };
  assert.equal(canPlacePiece(grid, square2x2, 0, 0), false);
  assert.equal(canPlacePiece(grid, square2x2, 1, 1), true);
});

test('placePiece places cells immutably and counts placed blocks', () => {
  const grid = createEmptyGrid(8, 8);
  const line3 = [[1, 1, 1]];
  const { nextGrid, blocksPlaced } = placePiece(grid, line3, 2, 3, '#ff007f');

  assert.equal(blocksPlaced, 3);
  assert.equal(grid[3][2].type, 'empty'); // original unmodified
  assert.equal(nextGrid[3][2].type, 'filled');
  assert.equal(nextGrid[3][3].type, 'filled');
  assert.equal(nextGrid[3][4].type, 'filled');
  assert.equal(nextGrid[3][5].type, 'empty');
});

test('checkCompletedLines detects filled horizontal and vertical lines', () => {
  let grid = createEmptyGrid(8, 8);
  // Fill entire row 2
  for (let c = 0; c < 8; c++) {
    grid[2][c] = { type: 'filled', color: '#00f0ff' };
  }
  // Fill entire col 5
  for (let r = 0; r < 8; r++) {
    grid[r][5] = { type: 'filled', color: '#00f0ff' };
  }

  const { rows, cols } = checkCompletedLines(grid);
  assert.deepEqual(rows, [2]);
  assert.deepEqual(cols, [5]);
});

test('clearLines empties completed rows and cols', () => {
  let grid = createEmptyGrid(8, 8);
  for (let c = 0; c < 8; c++) {
    grid[1][c] = { type: 'filled', color: '#00ff88' };
  }

  const { nextGrid, clearedCells } = clearLines(grid, [1], []);
  assert.equal(clearedCells.length, 8);
  assert.equal(nextGrid[1][0].type, 'empty');
  assert.equal(nextGrid[1][7].type, 'empty');
});

test('calculateScore awards points for placement and multi-line combo multiplier', () => {
  // Placement only
  const s0 = calculateScore(4, 0, 0, 0);
  assert.equal(s0.scoreGained, 40);
  assert.equal(s0.isCombo, false);

  // Single line
  const s1 = calculateScore(2, 1, 0, 0);
  assert.equal(s1.scoreGained, 20 + 100);

  // Double line clear with combo 2
  const s2 = calculateScore(3, 1, 1, 2);
  assert.ok(s2.scoreGained > 300);
  assert.equal(s2.isCombo, true);
});

test('hasAnyValidMove detects game over when no pieces fit', () => {
  const grid = createEmptyGrid(8, 8);
  // Fill everything except 1 cell
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      grid[r][c] = { type: 'filled', color: '#ff007f' };
    }
  }
  grid[0][0] = { type: 'empty' };

  const dot = RAW_PIECES.find((p) => p.id === 'dot-1')!;
  const square = RAW_PIECES.find((p) => p.id === 'square-2')!;

  // Dot can fit in the 1 empty cell
  assert.equal(hasAnyValidMove(grid, [dot]), true);

  // Square cannot fit in 1 empty cell
  assert.equal(hasAnyValidMove(grid, [square]), false);
});

test('Campaign levels generate 30 progressive difficulty levels', () => {
  const levels = getCampaignLevels();
  assert.equal(levels.length, 30);
  assert.equal(levels[0].level, 1);
  assert.equal(levels[29].level, 30);
  assert.ok(levels[29].targetScore > levels[0].targetScore);
});

test('encodeSyncData and decodeSyncData correctly round-trips player stats with checksum', () => {
  const stats: PlayerStats = {
    gamesPlayed: 14,
    totalScore: 54200,
    totalLinesCleared: 88,
    maxCombo: 6,
    campaignStars: { 1: 3, 2: 2, 3: 1 },
    unlockedLevel: 4,
    highScoreClassic: 12480,
    dailyStreak: 3,
    lastDailyDate: '2026-11-12',
    dailyCompletedDates: ['2026-11-11', '2026-11-12'],
    unlockedThemes: ['cyber-cyan', 'synth-magenta'],
    activeTheme: 'cyber-cyan',
  };

  const code = encodeSyncData(stats);
  assert.ok(typeof code === 'string' && code.length > 20);

  const decoded = decodeSyncData(code);
  assert.ok(decoded !== null);
  assert.equal(decoded?.highScoreClassic, 12480);
  assert.equal(decoded?.campaignStars[1], 3);
  assert.equal(decoded?.dailyStreak, 3);

  // Corrupted code returns null
  const corrupted = code.substring(0, code.length - 4) + 'XXXX';
  const failed = decodeSyncData(corrupted);
  assert.equal(failed, null);
});
