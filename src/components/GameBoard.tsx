import React, { useRef, useEffect } from 'react';
import { Grid, PieceShape } from '../game/types';
import { ParticlePool } from '../game/particles';

interface GameBoardProps {
  grid: Grid;
  activePiece: PieceShape | null;
  hoverPos: { x: number; y: number } | null;
  onCellClick: (x: number, y: number) => void;
  onCellHover: (x: number | null, y: number | null) => void;
  particlePool: ParticlePool;
  shakeTrauma?: number;
  highlightLines?: { rows: number[]; cols: number[] };
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  activePiece,
  hoverPos,
  onCellClick,
  onCellHover,
  particlePool,
  shakeTrauma = 0,
  highlightLines = { rows: [], cols: [] },
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const gridSize = grid.length || 8;

  // Particle render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlePool.update(dt);
      particlePool.draw(ctx);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [particlePool]);

  // Keep particle canvas aligned with board size
  useEffect(() => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      }
    });

    resizeObserver.observe(board);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute ghost piece cells
  const ghostCells = new Set<string>();
  let isGhostLegal = true;

  if (activePiece && hoverPos) {
    const matrix = activePiece.matrix;
    const pHeight = matrix.length;
    const pWidth = matrix[0].length;

    // Check bounds
    if (
      hoverPos.x < 0 ||
      hoverPos.y < 0 ||
      hoverPos.x + pWidth > gridSize ||
      hoverPos.y + pHeight > gridSize
    ) {
      isGhostLegal = false;
    } else {
      for (let r = 0; r < pHeight; r++) {
        for (let c = 0; c < pWidth; c++) {
          if (matrix[r][c] === 1) {
            const gx = hoverPos.x + c;
            const gy = hoverPos.y + r;
            ghostCells.add(`${gx},${gy}`);
            if (grid[gy][gx].type !== 'empty') {
              isGhostLegal = false;
            }
          }
        }
      }
    }
  }

  // Camera shake offset based on trauma
  const shakeX = shakeTrauma > 0 ? (Math.random() - 0.5) * shakeTrauma * 16 : 0;
  const shakeY = shakeTrauma > 0 ? (Math.random() - 0.5) * shakeTrauma * 16 : 0;

  return (
    <div
      ref={boardRef}
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        transition: shakeTrauma > 0 ? 'none' : 'transform 0.2s ease-out',
      }}
      className="relative p-2.5 sm:p-3 rounded-2xl bg-[#0c1017] border border-cyan-500/25 shadow-[0_0_35px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,240,255,0.05)] w-full max-w-[340px] sm:max-w-[420px] aspect-square mx-auto select-none touch-none"
      onPointerLeave={() => onCellHover(null, null)}
    >
      {/* Grid container */}
      <div
        className="grid gap-1 sm:gap-1.5 w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const isGhost = ghostCells.has(`${x},${y}`);
            const isRowCleared = highlightLines.rows.includes(y);
            const isColCleared = highlightLines.cols.includes(x);
            const isClearing = isRowCleared || isColCleared;

            return (
              <button
                key={`cell-${x}-${y}`}
                type="button"
                aria-label={`Grid cell ${x + 1}, ${y + 1}: ${cell.type}`}
                onClick={() => onCellClick(x, y)}
                onPointerEnter={() => onCellHover(x, y)}
                className={`relative rounded-md transition-all duration-150 flex items-center justify-center font-mono text-xs overflow-hidden ${
                  cell.type === 'empty'
                    ? isGhost
                      ? isGhostLegal
                        ? 'bg-cyan-500/35 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                        : 'bg-red-500/30 border border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                      : 'bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40'
                    : cell.type === 'obstacle'
                    ? 'bg-slate-800 border border-slate-600 text-slate-400 shadow-inner'
                    : cell.type === 'bomb'
                    ? 'bg-red-950/80 border border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse'
                    : cell.type === 'glitch'
                    ? 'bg-purple-950/90 border border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'border border-white/20'
                } ${isClearing ? 'scale-95 brightness-150 ring-2 ring-white animate-pulse' : ''}`}
                style={{
                  backgroundColor:
                    cell.type === 'filled' && cell.color
                      ? cell.color
                      : undefined,
                  boxShadow:
                    cell.type === 'filled' && cell.color
                      ? `0 0 10px ${cell.color}88, inset 0 0 6px rgba(255,255,255,0.4)`
                      : undefined,
                }}
              >
                {/* Visual texture for obstacles */}
                {cell.type === 'obstacle' && (
                  <div className="w-full h-full flex items-center justify-center opacity-40">
                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 2" />
                    </svg>
                  </div>
                )}

                {/* Numeric countdown for bombs */}
                {cell.type === 'bomb' && (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[11px] font-bold text-red-200 tabular-nums">
                      {cell.countdown}
                    </span>
                  </div>
                )}

                {/* Glitch badge for multiplayer penalty blocks */}
                {cell.type === 'glitch' && (
                  <span className="text-[10px] text-fuchsia-300 font-bold">✕</span>
                )}

                {/* Inner shine on filled blocks */}
                {cell.type === 'filled' && (
                  <div className="absolute top-0.5 left-0.5 right-0.5 h-1/3 bg-gradient-to-b from-white/35 to-transparent rounded-t-sm pointer-events-none" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Particle Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20 rounded-2xl"
      />
    </div>
  );
};
