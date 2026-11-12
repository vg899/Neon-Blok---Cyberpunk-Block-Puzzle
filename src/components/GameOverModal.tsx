import React, { useEffect } from 'react';
import { sound } from '../game/audio';
import { RotateCcw, Share2, Home } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  lines: number;
  maxCombo: number;
  onRestart: () => void;
  onShare: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  lines,
  maxCombo,
  onRestart,
  onShare,
  onExit,
}) => {
  const isNewRecord = score > 0 && score >= highScore;

  // Space or Enter to restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playClick();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-sm rounded-2xl border border-red-500/40 bg-[#0d111a] p-6 text-center shadow-[0_0_35px_rgba(239,68,68,0.25)] text-slate-100">
        <h2 className="text-xl font-bold font-mono text-red-400 tracking-wider uppercase mb-1">
          GRID OVERFLOW
        </h2>
        <p className="text-xs font-mono text-slate-400 mb-5">
          No remaining legal moves for polyomino blocks
        </p>

        {/* Primary score tile */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 mb-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
            FINAL SCORE
          </span>
          <div className="text-4xl font-extrabold font-mono text-white tabular-nums my-1">
            {score.toLocaleString()}
          </div>
          {isNewRecord && (
            <div className="text-[11px] font-mono font-bold text-amber-400 animate-pulse">
              ★ NEW ALL-TIME RECORD! ★
            </div>
          )}
        </div>

        {/* 2-3 Tabular stat tiles */}
        <div className="grid grid-cols-2 gap-2 mb-5 font-mono text-xs">
          <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60">
            <span className="text-[10px] text-slate-500 block">LINES CLEARED</span>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              {lines}
            </span>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60">
            <span className="text-[10px] text-slate-500 block">PEAK COMBO</span>
            <span className="text-lg font-bold text-amber-400 tabular-nums">
              {maxCombo}x
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2.5 font-mono text-xs">
          <button
            data-start="true"
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl border border-cyan-400 bg-cyan-950/50 text-cyan-200 font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-900/60 shadow-[0_0_20px_rgba(0,240,255,0.25)] transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again (Space / Enter)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onShare();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/30 text-fuchsia-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-fuchsia-900/40 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share High Score</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onExit();
            }}
            className="w-full py-2 px-4 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white flex items-center justify-center gap-2 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Exit to Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
