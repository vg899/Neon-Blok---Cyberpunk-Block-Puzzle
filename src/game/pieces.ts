import { PieceShape, NeonTheme } from './types';

export const NEON_THEMES: Record<string, NeonTheme> = {
  'cyber-cyan': {
    id: 'cyber-cyan',
    name: 'Cyber Cyan',
    primary: '#00f0ff',
    secondary: '#ff007f',
    accent: '#00ff88',
    glow: 'rgba(0, 240, 255, 0.5)',
    bgRgba: 'rgba(0, 240, 255, 0.08)',
  },
  'synth-magenta': {
    id: 'synth-magenta',
    name: 'Synth Magenta',
    primary: '#ff007f',
    secondary: '#00f0ff',
    accent: '#ffb800',
    glow: 'rgba(255, 0, 127, 0.5)',
    bgRgba: 'rgba(255, 0, 127, 0.08)',
  },
  'matrix-emerald': {
    id: 'matrix-emerald',
    name: 'Matrix Emerald',
    primary: '#00ff88',
    secondary: '#00f0ff',
    accent: '#a855f7',
    glow: 'rgba(0, 255, 136, 0.5)',
    bgRgba: 'rgba(0, 255, 136, 0.08)',
  },
  'solar-amber': {
    id: 'solar-amber',
    name: 'Solar Amber',
    primary: '#ffb800',
    secondary: '#ff4757',
    accent: '#00f0ff',
    glow: 'rgba(255, 184, 0, 0.5)',
    bgRgba: 'rgba(255, 184, 0, 0.08)',
  },
  'void-violet': {
    id: 'void-violet',
    name: 'Void Violet',
    primary: '#a855f7',
    secondary: '#00f0ff',
    accent: '#ff007f',
    glow: 'rgba(168, 85, 247, 0.5)',
    bgRgba: 'rgba(168, 85, 247, 0.08)',
  },
};

export const RAW_PIECES: PieceShape[] = [
  // 1x1 Monomino
  {
    id: 'dot-1',
    name: 'Single Bit',
    matrix: [[1]],
    color: '#00f0ff',
    rarity: 'common',
  },
  // 2x1 Dominoes
  {
    id: 'domino-h',
    name: 'Dual Vector H',
    matrix: [[1, 1]],
    color: '#00ff88',
    rarity: 'common',
  },
  {
    id: 'domino-v',
    name: 'Dual Vector V',
    matrix: [[1], [1]],
    color: '#00ff88',
    rarity: 'common',
  },
  // 3x1 Trominoes
  {
    id: 'line-3-h',
    name: 'Beam 3 H',
    matrix: [[1, 1, 1]],
    color: '#38bdf8',
    rarity: 'common',
  },
  {
    id: 'line-3-v',
    name: 'Beam 3 V',
    matrix: [[1], [1], [1]],
    color: '#38bdf8',
    rarity: 'common',
  },
  // 4x1 Tetrominoes
  {
    id: 'line-4-h',
    name: 'Laser 4 H',
    matrix: [[1, 1, 1, 1]],
    color: '#00f0ff',
    rarity: 'uncommon',
  },
  {
    id: 'line-4-v',
    name: 'Laser 4 V',
    matrix: [[1], [1], [1], [1]],
    color: '#00f0ff',
    rarity: 'uncommon',
  },
  // 5x1 Pentomino
  {
    id: 'line-5-h',
    name: 'Hyper Laser H',
    matrix: [[1, 1, 1, 1, 1]],
    color: '#a855f7',
    rarity: 'rare',
  },
  {
    id: 'line-5-v',
    name: 'Hyper Laser V',
    matrix: [[1], [1], [1], [1], [1]],
    color: '#a855f7',
    rarity: 'rare',
  },
  // 2x2 Square
  {
    id: 'square-2',
    name: 'Block Core',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: '#ffb800',
    rarity: 'common',
  },
  // 3x3 Large Square
  {
    id: 'square-3',
    name: 'Mega Cube',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: '#ff4757',
    rarity: 'rare',
  },
  // L-Trominoes (2x2 corner)
  {
    id: 'corner-tl',
    name: 'Corner TL',
    matrix: [
      [1, 1],
      [1, 0],
    ],
    color: '#ff007f',
    rarity: 'common',
  },
  {
    id: 'corner-tr',
    name: 'Corner TR',
    matrix: [
      [1, 1],
      [0, 1],
    ],
    color: '#ff007f',
    rarity: 'common',
  },
  {
    id: 'corner-bl',
    name: 'Corner BL',
    matrix: [
      [1, 0],
      [1, 1],
    ],
    color: '#ff007f',
    rarity: 'common',
  },
  {
    id: 'corner-br',
    name: 'Corner BR',
    matrix: [
      [0, 1],
      [1, 1],
    ],
    color: '#ff007f',
    rarity: 'common',
  },
  // 3x3 L-Shapes
  {
    id: 'big-corner-tl',
    name: 'Tri-Corner TL',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    color: '#ec4899',
    rarity: 'rare',
  },
  {
    id: 'big-corner-br',
    name: 'Tri-Corner BR',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#ec4899',
    rarity: 'rare',
  },
  // Classic Tetris L and J
  {
    id: 'tetris-l-1',
    name: 'L-Relay 1',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: '#f97316',
    rarity: 'common',
  },
  {
    id: 'tetris-l-2',
    name: 'L-Relay 2',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: '#f97316',
    rarity: 'common',
  },
  {
    id: 'tetris-l-3',
    name: 'L-Relay 3',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    color: '#f97316',
    rarity: 'common',
  },
  {
    id: 'tetris-l-4',
    name: 'L-Relay 4',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    color: '#f97316',
    rarity: 'common',
  },
  // T-Shapes
  {
    id: 'tetris-t-up',
    name: 'T-Node Up',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#a855f7',
    rarity: 'common',
  },
  {
    id: 'tetris-t-down',
    name: 'T-Node Down',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: '#a855f7',
    rarity: 'common',
  },
  {
    id: 'tetris-t-left',
    name: 'T-Node Left',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    color: '#a855f7',
    rarity: 'common',
  },
  {
    id: 'tetris-t-right',
    name: 'T-Node Right',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    color: '#a855f7',
    rarity: 'common',
  },
  // S & Z shapes
  {
    id: 'tetris-s-h',
    name: 'S-Matrix H',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#10b981',
    rarity: 'uncommon',
  },
  {
    id: 'tetris-s-v',
    name: 'S-Matrix V',
    matrix: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    color: '#10b981',
    rarity: 'uncommon',
  },
  {
    id: 'tetris-z-h',
    name: 'Z-Matrix H',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#ef4444',
    rarity: 'uncommon',
  },
  {
    id: 'tetris-z-v',
    name: 'Z-Matrix V',
    matrix: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    color: '#ef4444',
    rarity: 'uncommon',
  },
  // Special Plus Shape
  {
    id: 'plus-cross',
    name: 'Plasma Cross',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: '#ffd700',
    rarity: 'rare',
  },
  // U-shape
  {
    id: 'u-shape',
    name: 'Flux Magnet',
    matrix: [
      [1, 0, 1],
      [1, 1, 1],
    ],
    color: '#06b6d4',
    rarity: 'rare',
  },
];
