import React, { useState, useEffect, useRef } from 'react';
import { Grid, PieceShape } from '../game/types';
import {
  createEmptyGrid,
  canPlacePiece,
  placePiece,
  checkCompletedLines,
  clearLines,
  calculateScore,
  hasAnyValidMove,
  generatePieces,
} from '../game/rules';
import { sound } from '../game/audio';
import { ParticlePool } from '../game/particles';
import { GameBoard } from './GameBoard';
import { PieceTray } from './PieceTray';
import { ArrowLeft, Swords, Trophy, RotateCcw } from 'lucide-react';

interface MultiplayerDuelProps {
  onExit: () => void;
}

export const MultiplayerDuel: React.FC<MultiplayerDuelProps> = ({ onExit }) => {
  // P1 State
  const [grid1, setGrid1] = useState<Grid>(() => createEmptyGrid(8, 8));
  const [pieces1, setPieces1] = useState<(PieceShape | null)[]>(() => generatePieces(3, 1));
  const [selected1, setSelected1] = useState<number | null>(null);
  const [hover1, setHover1] = useState<{ x: number; y: number } | null>(null);
  const [score1, setScore1] = useState(0);
  const [sets1, setSets1] = useState(0);

  // P2 State
  const [grid2, setGrid2] = useState<Grid>(() => createEmptyGrid(8, 8));
  const [pieces2, setPieces2] = useState<(PieceShape | null)[]>(() => generatePieces(3, 1));
  const [selected2, setSelected2] = useState<number | null>(null);
  const [hover2, setHover2] = useState<{ x: number; y: number } | null>(null);
  const [score2, setScore2] = useState(0);
  const [sets2, setSets2] = useState(0);

  // Target score for a round
  const TARGET_SCORE = 2000;
  const [winner, setWinner] = useState<'p1' | 'p2' | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const particles1 = useRef(new ParticlePool()).current;
  const particles2 = useRef(new ParticlePool()).current;

  // Refill P1 tray when empty
  useEffect(() => {
    if (pieces1.every((p) => p === null)) {
      const nextBatch = generatePieces(3, 1);
      setPieces1(nextBatch);
      setSelected1(null);
      if (!hasAnyValidMove(grid1, nextBatch)) {
        handlePlayerDefeat('p1');
      }
    }
  }, [pieces1, grid1]);

  // Refill P2 tray when empty
  useEffect(() => {
    if (pieces2.every((p) => p === null)) {
      const nextBatch = generatePieces(3, 1);
      setPieces2(nextBatch);
      setSelected2(null);
      if (!hasAnyValidMove(grid2, nextBatch)) {
        handlePlayerDefeat('p2');
      }
    }
  }, [pieces2, grid2]);

  const handlePlayerDefeat = (defeated: 'p1' | 'p2') => {
    const vict = defeated === 'p1' ? 'p2' : 'p1';
    setWinner(vict);
    sound.playVictory();
    if (vict === 'p1') {
      setSets1((s) => s + 1);
      setAnnouncement('PLAYER 1 SURVIVES & CLAIMS ROUND!');
    } else {
      setSets2((s) => s + 1);
      setAnnouncement('PLAYER 2 SURVIVES & CLAIMS ROUND!');
    }
  };

  // Check score target victory
  useEffect(() => {
    if (winner) return;
    if (score1 >= TARGET_SCORE) {
      setWinner('p1');
      setSets1((s) => s + 1);
      sound.playVictory();
      setAnnouncement('PLAYER 1 REACHES 2,000 PTS & WINS!');
    } else if (score2 >= TARGET_SCORE) {
      setWinner('p2');
      setSets2((s) => s + 1);
      sound.playVictory();
      setAnnouncement('PLAYER 2 REACHES 2,000 PTS & WINS!');
    }
  }, [score1, score2, winner]);

  // Attack: send glitch penalty block to opponent
  const sendGlitchAttack = (target: 'p1' | 'p2', count: number) => {
    const updateGrid = target === 'p1' ? setGrid1 : setGrid2;
    updateGrid((prev) => {
      const emptySlots: { x: number; y: number }[] = [];
      prev.forEach((row, y) =>
        row.forEach((cell, x) => {
          if (cell.type === 'empty') emptySlots.push({ x, y });
        })
      );
      if (emptySlots.length === 0) return prev;

      const next = prev.map((r) => r.map((c) => ({ ...c })));
      for (let i = 0; i < count && emptySlots.length > 0; i++) {
        const idx = Math.floor(Math.random() * emptySlots.length);
        const { x, y } = emptySlots.splice(idx, 1)[0];
        next[y][x] = {
          type: 'glitch',
          color: target === 'p1' ? '#ff007f' : '#00f0ff',
        };
      }
      return next;
    });

    setAnnouncement(`GLITCH ATTACK! ${count} Penalty Blocks Sent!`);
    setTimeout(() => setAnnouncement(null), 1800);
  };

  // Place block for Player 1
  const handleP1CellClick = (x: number, y: number) => {
    if (winner || selected1 === null || !pieces1[selected1]) return;
    const piece = pieces1[selected1]!;

    if (!canPlacePiece(grid1, piece.matrix, x, y)) {
      sound.playError();
      return;
    }

    sound.playPlacePiece();
    const { nextGrid: placedGrid, blocksPlaced } = placePiece(grid1, piece.matrix, x, y, piece.color);
    const { rows, cols } = checkCompletedLines(placedGrid);
    const lineCount = rows.length + cols.length;

    let finalGrid = placedGrid;
    if (lineCount > 0) {
      const { nextGrid, clearedCells } = clearLines(placedGrid, rows, cols);
      finalGrid = nextGrid;
      sound.playLineClear(lineCount, 1);
      clearedCells.forEach((c) => {
        particles1.emitBurst(c.x * 40 + 20, c.y * 40 + 20, c.color || '#00f0ff');
      });

      // Attack opponent if cleared >= 2 lines!
      if (lineCount >= 2) {
        sendGlitchAttack('p2', lineCount);
      }
    }

    const { scoreGained } = calculateScore(blocksPlaced, rows.length, cols.length, lineCount > 0 ? 1 : 0);
    setScore1((s) => s + scoreGained);

    const nextPieces = [...pieces1];
    nextPieces[selected1] = null;
    setPieces1(nextPieces);
    setSelected1(null);
    setGrid1(finalGrid);
  };

  // Place block for Player 2
  const handleP2CellClick = (x: number, y: number) => {
    if (winner || selected2 === null || !pieces2[selected2]) return;
    const piece = pieces2[selected2]!;

    if (!canPlacePiece(grid2, piece.matrix, x, y)) {
      sound.playError();
      return;
    }

    sound.playPlacePiece();
    const { nextGrid: placedGrid, blocksPlaced } = placePiece(grid2, piece.matrix, x, y, piece.color);
    const { rows, cols } = checkCompletedLines(placedGrid);
    const lineCount = rows.length + cols.length;

    let finalGrid = placedGrid;
    if (lineCount > 0) {
      const { nextGrid, clearedCells } = clearLines(placedGrid, rows, cols);
      finalGrid = nextGrid;
      sound.playLineClear(lineCount, 1);
      clearedCells.forEach((c) => {
        particles2.emitBurst(c.x * 40 + 20, c.y * 40 + 20, c.color || '#ff007f');
      });

      // Attack opponent if cleared >= 2 lines!
      if (lineCount >= 2) {
        sendGlitchAttack('p1', lineCount);
      }
    }

    const { scoreGained } = calculateScore(blocksPlaced, rows.length, cols.length, lineCount > 0 ? 1 : 0);
    setScore2((s) => s + scoreGained);

    const nextPieces = [...pieces2];
    nextPieces[selected2] = null;
    setPieces2(nextPieces);
    setSelected2(null);
    setGrid2(finalGrid);
  };

  // Reset for next rematch
  const handleRematch = () => {
    setGrid1(createEmptyGrid(8, 8));
    setGrid2(createEmptyGrid(8, 8));
    setPieces1(generatePieces(3, 1));
    setPieces2(generatePieces(3, 1));
    setSelected1(null);
    setSelected2(null);
    setScore1(0);
    setScore2(0);
    setWinner(null);
    setAnnouncement(null);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#07080d] text-slate-100 overflow-hidden select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 w-full max-w-7xl mx-auto">
        <button
          onClick={() => {
            sound.playClick();
            onExit();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Title</span>
        </button>

        {/* Duel Score Board */}
        <div className="flex items-center gap-4 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-cyan-400 font-bold block">P1 (CYAN)</span>
            <span className="text-base font-bold text-white tabular-nums">{score1}</span>
          </div>

          <div className="flex flex-col items-center px-3 py-0.5 rounded bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
              <Swords className="w-3.5 h-3.5" />
              <span>SETS</span>
            </div>
            <span className="text-xs text-white font-bold tabular-nums">
              {sets1} : {sets2}
            </span>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-fuchsia-400 font-bold block">P2 (MAGENTA)</span>
            <span className="text-base font-bold text-white tabular-nums">{score2}</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          GOAL: <span className="text-amber-400 font-bold tabular-nums">{TARGET_SCORE}</span> PTS
        </div>
      </header>

      {/* Duel Banner Notice */}
      {announcement && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-fuchsia-950/90 border border-fuchsia-500 text-fuchsia-200 text-xs font-mono font-bold shadow-[0_0_20px_rgba(255,0,127,0.5)] animate-bounce">
          {announcement}
        </div>
      )}

      {/* Split Duel Arena */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-w-6xl mx-auto w-full items-center overflow-y-auto">
        {/* Player 1 Side */}
        <section className="flex flex-col items-center p-3 rounded-2xl border border-cyan-500/30 bg-cyan-950/10">
          <div className="flex items-center justify-between w-full px-2 mb-2 font-mono text-xs">
            <span className="text-cyan-400 font-bold tracking-wide">PLAYER 1 [CYAN]</span>
            <span className="text-slate-400">Select: Click slot / 1-3</span>
          </div>

          <GameBoard
            grid={grid1}
            activePiece={selected1 !== null ? pieces1[selected1] : null}
            hoverPos={hover1}
            onCellClick={handleP1CellClick}
            onCellHover={(x, y) => setHover1(x !== null && y !== null ? { x, y } : null)}
            particlePool={particles1}
          />

          <PieceTray
            pieces={pieces1}
            selectedIndex={selected1}
            onSelectPiece={(idx) => {
              sound.playClick();
              setSelected1(idx);
            }}
            grid={grid1}
            compact
          />
        </section>

        {/* Player 2 Side */}
        <section className="flex flex-col items-center p-3 rounded-2xl border border-fuchsia-500/30 bg-fuchsia-950/10">
          <div className="flex items-center justify-between w-full px-2 mb-2 font-mono text-xs">
            <span className="text-fuchsia-400 font-bold tracking-wide">PLAYER 2 [MAGENTA]</span>
            <span className="text-slate-400">Select: Click slot</span>
          </div>

          <GameBoard
            grid={grid2}
            activePiece={selected2 !== null ? pieces2[selected2] : null}
            hoverPos={hover2}
            onCellClick={handleP2CellClick}
            onCellHover={(x, y) => setHover2(x !== null && y !== null ? { x, y } : null)}
            particlePool={particles2}
          />

          <PieceTray
            pieces={pieces2}
            selectedIndex={selected2}
            onSelectPiece={(idx) => {
              sound.playClick();
              setSelected2(idx);
            }}
            grid={grid2}
            compact
          />
        </section>
      </main>

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-amber-500/50 bg-[#0d111a] p-6 text-center shadow-[0_0_35px_rgba(255,184,0,0.3)] text-slate-100">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h2 className="text-xl font-extrabold font-mono text-white tracking-wide uppercase">
              {winner === 'p1' ? 'PLAYER 1 WINS!' : 'PLAYER 2 WINS!'}
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1 mb-4">
              Match set recorded. Clearing 2+ lines sends glitch blocks!
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  handleRematch();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-900/60 transition shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Next Set</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onExit();
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-mono text-xs hover:text-white transition"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
