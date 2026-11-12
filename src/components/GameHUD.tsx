import React from 'react';
import { Volume2, VolumeX, Pause, RotateCcw, Home } from 'lucide-react';
import { sound } from '../game/audio';

interface GameHUDProps {
  score: number;
  highScore: number;
  combo: number;
  mode: string;
  levelNumber?: number;
  targetScore?: number;
  moveLimit?: number;
  movesMade?: number;
  targetLines?: number;
  linesCleared?: number;
  onPause: () => void;
  onRestart: () => void;
  onExit: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  combo,
  mode,
  levelNumber,
  targetScore,
  moveLimit,
  movesMade = 0,
  targetLines,
  linesCleared = 0,
  onPause,
  onRestart,
  onExit,
  isMuted,
  onToggleMute,
}) => {
  const movesRemaining = typeof moveLimit === 'number' ? Math.max(0, moveLimit - movesMade) : null;

  return (
    <header className="w-full max-w-xl mx-auto flex flex-col gap-2 pt-2 pb-1 px-4 select-none">
      {/* Top utility row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onExit();
            }}
            aria-label="Exit to Title Menu"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:text-white text-slate-400 transition"
          >
            <Home className="w-4 h-4" />
          </button>

          <div className="flex items-baseline gap-1.5 font-mono text-xs">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">
              {mode === 'campaign' ? `SECTOR 0${levelNumber}` : mode.toUpperCase()}
            </span>
            {targetScore && (
              <span className="text-slate-500 text-[11px]">
                / GOAL <span className="tabular-nums text-slate-300">{targetScore}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
            className={`p-1.5 rounded-lg border transition ${
              isMuted
                ? 'border-slate-800 bg-slate-900/40 text-slate-500'
                : 'border-cyan-500/30 bg-cyan-950/30 text-cyan-400'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            aria-label="Restart Game (R)"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:text-white text-slate-400 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onPause();
            }}
            aria-label="Pause Game (Esc/P)"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300 transition"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Score & Combo Bar */}
      <div className="flex items-end justify-between px-1">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">
            SCORE
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums text-white">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Secondary metrics (Combo & Target/Moves) */}
        <div className="flex items-center gap-4 text-right">
          {combo > 1 && (
            <div className="flex flex-col items-end animate-bounce">
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                COMBO
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-amber-300 drop-shadow-[0_0_8px_rgba(255,184,0,0.6)]">
                {combo}x
              </span>
            </div>
          )}

          {typeof movesRemaining === 'number' && (
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">
                MOVES
              </span>
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  movesRemaining <= 3 ? 'text-red-400 animate-pulse' : 'text-slate-200'
                }`}
              >
                {movesRemaining}
              </span>
            </div>
          )}

          {typeof targetLines === 'number' && (
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">
                LINES
              </span>
              <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                {linesCleared}/{targetLines}
              </span>
            </div>
          )}

          {!targetScore && !movesRemaining && (
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">
                BEST
              </span>
              <span className="text-lg font-bold font-mono tabular-nums text-cyan-400">
                {highScore.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
