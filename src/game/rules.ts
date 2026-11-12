import { Grid, GridCell, PieceShape, LevelConfig, PlayerStats, SyncPayload } from './types';
import { RAW_PIECES } from './pieces';

export const GRID_SIZE_DEFAULT = 8;

/**
 * Creates an empty grid with specified dimensions.
 */
export function createEmptyGrid(width = GRID_SIZE_DEFAULT, height = GRID_SIZE_DEFAULT): Grid {
  const grid: Grid = [];
  for (let y = 0; y < height; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ type: 'empty' });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Checks whether a piece shape can legally be placed at (startX, startY).
 */
export function canPlacePiece(grid: Grid, matrix: number[][], startX: number, startY: number): boolean {
  const height = grid.length;
  if (height === 0) return false;
  const width = grid[0].length;

  const pieceHeight = matrix.length;
  const pieceWidth = matrix[0].length;

  // Boundary check
  if (startX < 0 || startY < 0 || startX + pieceWidth > width || startY + pieceHeight > height) {
    return false;
  }

  // Cell vacancy check
  for (let r = 0; r < pieceHeight; r++) {
    for (let c = 0; c < pieceWidth; c++) {
      if (matrix[r][c] === 1) {
        const targetCell = grid[startY + r][startX + c];
        if (targetCell.type !== 'empty') {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Places a piece onto the grid, returning a new immutable grid and count of blocks placed.
 */
export function placePiece(
  grid: Grid,
  matrix: number[][],
  startX: number,
  startY: number,
  color: string,
  cellType: 'filled' | 'glitch' = 'filled'
): { nextGrid: Grid; blocksPlaced: number } {
  const nextGrid: Grid = grid.map((row) => row.map((cell) => ({ ...cell })));
  let blocksPlaced = 0;

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        nextGrid[startY + r][startX + c] = {
          type: cellType,
          color,
          id: `cell-${Date.now()}-${r}-${c}-${Math.random()}`,
        };
        blocksPlaced++;
      }
    }
  }

  return { nextGrid, blocksPlaced };
}

/**
 * Checks for any fully completed rows and columns.
 */
export function checkCompletedLines(grid: Grid): { rows: number[]; cols: number[] } {
  const height = grid.length;
  if (height === 0) return { rows: [], cols: [] };
  const width = grid[0].length;

  const fullRows: number[] = [];
  const fullCols: number[] = [];

  // Check rows
  for (let r = 0; r < height; r++) {
    let isRowFull = true;
    for (let c = 0; c < width; c++) {
      if (grid[r][c].type === 'empty') {
        isRowFull = false;
        break;
      }
    }
    if (isRowFull) {
      fullRows.push(r);
    }
  }

  // Check cols
  for (let c = 0; c < width; c++) {
    let isColFull = true;
    for (let r = 0; r < height; r++) {
      if (grid[r][c].type === 'empty') {
        isColFull = false;
        break;
      }
    }
    if (isColFull) {
      fullCols.push(c);
    }
  }

  return { rows: fullRows, cols: fullCols };
}

/**
 * Clears completed rows and columns, returning the updated grid and cleared cell coordinates.
 */
export function clearLines(
  grid: Grid,
  rows: number[],
  cols: number[]
): { nextGrid: Grid; clearedCells: { x: number; y: number; color?: string }[] } {
  const height = grid.length;
  if (height === 0) return { nextGrid: grid, clearedCells: [] };
  const width = grid[0].length;

  const nextGrid: Grid = grid.map((row) => row.map((cell) => ({ ...cell })));
  const clearedCells: { x: number; y: number; color?: string }[] = [];
  const clearedSet = new Set<string>();

  for (const r of rows) {
    for (let c = 0; c < width; c++) {
      const key = `${c},${r}`;
      if (!clearedSet.has(key)) {
        clearedSet.add(key);
        clearedCells.push({ x: c, y: r, color: grid[r][c].color });
      }
      nextGrid[r][c] = { type: 'empty' };
    }
  }

  for (const c of cols) {
    for (let r = 0; r < height; r++) {
      const key = `${c},${r}`;
      if (!clearedSet.has(key)) {
        clearedSet.add(key);
        clearedCells.push({ x: c, y: r, color: grid[r][c].color });
      }
      nextGrid[r][c] = { type: 'empty' };
    }
  }

  return { nextGrid, clearedCells };
}

/**
 * Calculates score for a move.
 */
export function calculateScore(
  blocksPlaced: number,
  rowsCount: number,
  colsCount: number,
  comboCount: number,
  multiplier = 1
): { scoreGained: number; comboBonus: number; isCombo: boolean } {
  const placementScore = blocksPlaced * 10;
  const totalLines = rowsCount + colsCount;

  if (totalLines === 0) {
    return {
      scoreGained: Math.round(placementScore * multiplier),
      comboBonus: 0,
      isCombo: false,
    };
  }

  // Base line score: 100 per line + bonus for multi-line simultaneous clear
  const lineScoreBase = totalLines * 100;
  const multiLineBonus = totalLines > 1 ? Math.pow(2, totalLines - 1) * 60 : 0;
  
  // Combo bonus: scales with current combo streak
  const comboMultiplier = 1 + Math.max(0, comboCount) * 0.4;
  const rawLineScore = (lineScoreBase + multiLineBonus) * comboMultiplier;

  const total = Math.round((placementScore + rawLineScore) * multiplier);
  return {
    scoreGained: total,
    comboBonus: Math.round(rawLineScore - (lineScoreBase + multiLineBonus)),
    isCombo: comboCount > 0,
  };
}

/**
 * Tests if any of the remaining pieces in the tray have a legal placement on the board.
 */
export function hasAnyValidMove(grid: Grid, pieces: (PieceShape | null)[]): boolean {
  const height = grid.length;
  if (height === 0) return false;
  const width = grid[0].length;

  for (const piece of pieces) {
    if (!piece) continue;
    const pHeight = piece.matrix.length;
    const pWidth = piece.matrix[0].length;

    for (let y = 0; y <= height - pHeight; y++) {
      for (let x = 0; x <= width - pWidth; x++) {
        if (canPlacePiece(grid, piece.matrix, x, y)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Generates a randomized batch of 3 pieces tailored to difficulty tier.
 */
export function generatePieces(count = 3, tier = 1): PieceShape[] {
  // Filter pieces by tier
  let pool = RAW_PIECES.filter((p) => p.rarity === 'common');
  if (tier >= 2) {
    pool = [...pool, ...RAW_PIECES.filter((p) => p.rarity === 'uncommon')];
  }
  if (tier >= 3) {
    pool = RAW_PIECES;
  }

  const result: PieceShape[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    result.push({ ...pool[randomIndex] });
  }
  return result;
}

/**
 * Ticks countdown bombs down by 1. Returns updated grid and whether any bomb exploded.
 */
export function tickBombs(grid: Grid): { nextGrid: Grid; bombDetonated: boolean } {
  let bombDetonated = false;
  const nextGrid = grid.map((row) =>
    row.map((cell) => {
      if (cell.type === 'bomb' && typeof cell.countdown === 'number') {
        const nextCount = cell.countdown - 1;
        if (nextCount <= 0) {
          bombDetonated = true;
        }
        return { ...cell, countdown: nextCount };
      }
      return { ...cell };
    })
  );

  return { nextGrid, bombDetonated };
}

/**
 * 30 progressive campaign levels with distinct objectives and obstacles.
 */
export function getCampaignLevels(): LevelConfig[] {
  const levels: LevelConfig[] = [];

  for (let i = 1; i <= 30; i++) {
    const targetScore = Math.round(400 + i * 250 + Math.pow(i, 1.4) * 80);
    const star1 = targetScore;
    const star2 = Math.round(targetScore * 1.3);
    const star3 = Math.round(targetScore * 1.7);

    let description = `Reach ${targetScore} points to clear the protocol.`;
    const obstacles: { x: number; y: number }[] = [];
    const bombs: { x: number; y: number; turns: number }[] = [];
    let moveLimit: number | undefined = undefined;
    let targetLines: number | undefined = undefined;

    // Obstacles start appearing from level 4
    if (i >= 4 && i < 12) {
      const obstacleCount = Math.min(8, Math.floor((i - 2) * 0.9));
      description = `Clear lines to vaporize ${obstacleCount} frozen grid obstacles.`;
      // Deterministic layout per level
      for (let o = 0; o < obstacleCount; o++) {
        const ox = (o * 3 + 2) % 8;
        const oy = (o * 2 + 1) % 8;
        obstacles.push({ x: ox, y: oy });
      }
    }

    // Move limits from level 12 to 18
    if (i >= 12 && i < 20) {
      moveLimit = Math.max(14, 28 - Math.floor((i - 12) * 1.5));
      targetLines = 6 + Math.floor((i - 12) * 1.2);
      description = `Clear ${targetLines} lines within ${moveLimit} piece placements!`;
    }

    // Bombs from level 20 to 30
    if (i >= 20) {
      const bombCount = Math.min(4, Math.floor((i - 18) * 0.5) + 1);
      description = `Defuse ${bombCount} countdown bombs before their timer expires!`;
      for (let b = 0; b < bombCount; b++) {
        bombs.push({
          x: 2 + (b * 2) % 5,
          y: 2 + (b * 2) % 5,
          turns: 9 - Math.min(4, Math.floor((i - 20) * 0.4)),
        });
      }
    }

    levels.push({
      level: i,
      name: `SECTOR 0${i < 10 ? '0' + i : i}`,
      gridSize: 8,
      targetScore,
      moveLimit,
      targetLines,
      initialObstacles: obstacles.length > 0 ? obstacles : undefined,
      initialBombs: bombs.length > 0 ? bombs : undefined,
      starsThresholds: [star1, star2, star3],
      description,
    });
  }

  return levels;
}

/**
 * Generates a deterministic daily challenge from a date string (YYYY-MM-DD).
 */
export function generateDailyChallenge(dateStr: string): LevelConfig {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const targetScore = 2000 + (positiveHash % 15) * 100;
  const targetLines = 8 + (positiveHash % 8);
  const moveLimit = 22 + (positiveHash % 10);

  const initialObstacles: { x: number; y: number }[] = [];
  const obstacleCount = 2 + (positiveHash % 4);
  for (let i = 0; i < obstacleCount; i++) {
    initialObstacles.push({
      x: (positiveHash + i * 3) % 8,
      y: (positiveHash + i * 5) % 8,
    });
  }

  return {
    level: 999,
    name: `DAILY PROTOCOL // ${dateStr}`,
    gridSize: 8,
    targetScore,
    targetLines,
    moveLimit,
    initialObstacles,
    starsThresholds: [targetScore, Math.round(targetScore * 1.3), Math.round(targetScore * 1.6)],
    description: `Clear ${targetLines} lines and reach ${targetScore} pts in ${moveLimit} moves!`,
  };
}

/**
 * Simple checksum generator for sync payload integrity.
 */
function computeChecksum(dataStr: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < dataStr.length; i++) {
    hash ^= dataStr.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Encodes player stats into a base64 transferrable sync code.
 */
export function encodeSyncData(stats: PlayerStats): string {
  const payloadWithoutChecksum: Omit<SyncPayload, 'checksum'> = {
    version: 1,
    timestamp: Date.now(),
    stats,
  };
  const jsonStr = JSON.stringify(payloadWithoutChecksum);
  const checksum = computeChecksum(jsonStr);
  const fullPayload: SyncPayload = {
    ...payloadWithoutChecksum,
    checksum,
  };
  const str = JSON.stringify(fullPayload);
  
  if (typeof btoa !== 'undefined') {
    return btoa(encodeURIComponent(str));
  }
  return Buffer.from(encodeURIComponent(str)).toString('base64');
}

/**
 * Decodes and validates a transferrable sync code.
 */
export function decodeSyncData(syncCode: string): PlayerStats | null {
  try {
    let jsonStr = '';
    if (typeof atob !== 'undefined') {
      jsonStr = decodeURIComponent(atob(syncCode.trim()));
    } else {
      jsonStr = decodeURIComponent(Buffer.from(syncCode.trim(), 'base64').toString());
    }

    const payload: SyncPayload = JSON.parse(jsonStr);
    if (!payload || !payload.stats || !payload.checksum) return null;

    const payloadWithoutChecksum = {
      version: payload.version,
      timestamp: payload.timestamp,
      stats: payload.stats,
    };
    const expectedChecksum = computeChecksum(JSON.stringify(payloadWithoutChecksum));

    if (expectedChecksum !== payload.checksum) {
      console.warn('Sync code checksum mismatch');
      return null;
    }

    return payload.stats;
  } catch (err) {
    console.error('Failed to parse sync code', err);
    return null;
  }
}
