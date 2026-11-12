import React from 'react';
import { PieceShape, Grid } from '../game/types';
import { canPlacePiece } from '../game/rules';

interface PieceTrayProps {
  pieces: (PieceShape | null)[];
  selectedIndex: number | null;
  onSelectPiece: (index: number) => void;
  grid: Grid;
  compact?: boolean;
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  pieces,
  selectedIndex,
  onSelectPiece,
  grid,
  compact = false,
}) => {
  const gridSize = grid.length || 8;

  // Helper to check if a piece has any legal move left on current grid
  const checkCanPieceFit = (piece: PieceShape | null): boolean => {
    if (!piece) return false;
    const pHeight = piece.matrix.length;
    const pWidth = piece.matrix[0].length;

    for (let y = 0; y <= gridSize - pHeight; y++) {
      for (let x = 0; x <= gridSize - pWidth; x++) {
        if (canPlacePiece(grid, piece.matrix, x, y)) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <div className={`flex items-center justify-center gap-3 w-full max-w-lg mx-auto ${compact ? 'py-1' : 'py-3'}`}>
      {pieces.map((piece, index) => {
        if (!piece) {
          return (
            <div
              key={`empty-slot-${index}`}
              className={`flex-1 flex items-center justify-center rounded-xl border border-dashed border-slate-800/80 bg-slate-950/30 ${
                compact ? 'h-18' : 'h-24 sm:h-28'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-700">EMPTY</span>
            </div>
          );
        }

        const isSelected = selectedIndex === index;
        const canFit = checkCanPieceFit(piece);
        const matrix = piece.matrix;
        const pHeight = matrix.length;
        const pWidth = matrix[0].length;

        return (
          <button
            key={`piece-${piece.id}-${index}`}
            type="button"
            onClick={() => onSelectPiece(index)}
            aria-label={`Select ${piece.name} piece (${index + 1})`}
            className={`group relative flex-1 flex flex-col items-center justify-center rounded-xl p-2 transition-all duration-150 border cursor-pointer ${
              compact ? 'h-18' : 'h-24 sm:h-28'
            } ${
              isSelected
                ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,240,255,0.35)] scale-105'
                : canFit
                ? 'border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-900/90'
                : 'border-slate-800/40 bg-slate-950/40 opacity-40 cursor-not-allowed'
            }`}
          >
            {/* Slot indicator badge */}
            <span
              className={`absolute top-1.5 left-2 font-mono text-[9px] ${
                isSelected ? 'text-cyan-300 font-bold' : 'text-slate-500'
              }`}
            >
              [{index + 1}]
            </span>

            {/* Polyomino preview */}
            <div
              className="grid gap-1 pointer-events-none"
              style={{
                gridTemplateColumns: `repeat(${pWidth}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${pHeight}, minmax(0, 1fr))`,
              }}
            >
              {matrix.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`p-${r}-${c}`}
                    className={`rounded-xs transition-colors ${
                      compact ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
                    }`}
                    style={{
                      backgroundColor: val === 1 ? piece.color : 'transparent',
                      boxShadow:
                        val === 1 && isSelected
                          ? `0 0 8px ${piece.color}`
                          : undefined,
                    }}
                  />
                ))
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
