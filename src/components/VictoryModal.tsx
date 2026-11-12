import React, { useEffect } from 'react';
import { sound } from '../game/audio';
import { Star, Play, Share2, Home } from 'lucide-react';

interface VictoryModalProps {
  score: number;
  levelNumber?: number;
  starsEarned: number;
  lines: number;
  onNextStage?: () => void;
  onShare: () => void;
  onExit: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  levelNumber,
  starsEarned,
  lines,
  onNextStage,
  onShare,
  onExit,
}) => {
  // Space or Enter to continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playClick();
        if (onNextStage) onNextStage();
        else onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextStage, onExit]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-sm rounded-2xl border border-amber-500/50 bg-[#0d111a] p-6 text-center shadow-[0_0_35px_rgba(255,184,0,0.3)] text-slate-100">
        <h2 className="text-xl font-bold font-mono text-amber-400 tracking-wider uppercase mb-1">
          PROTOCOL CLEARED!
        </h2>
        <p className="text-xs font-mono text-slate-400 mb-4">
          {levelNumber ? `Sector 0${levelNumber} Complete` : 'Mission Objective Accomplished'}
        </p>

        {/* Stars earned */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 transition-all ${
                starIdx <= starsEarned
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(255,184,0,0.8)] scale-110'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Primary score tile */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 mb-4 font-mono">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
            ACHIEVED SCORE
          </span>
          <div className="text-3xl font-extrabold text-white tabular-nums my-1">
            {score.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400">
            {lines} Lines Cleared
          </span>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2.5 font-mono text-xs">
          {onNextStage ? (
            <button
              data-start="true"
              onClick={() => {
                sound.playClick();
                onNextStage();
              }}
              className="w-full py-3 px-4 rounded-xl border border-emerald-400 bg-emerald-950/50 text-emerald-200 font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-900/60 shadow-[0_0_20px_rgba(0,255,136,0.25)] transition"
            >
              <Play className="w-4 h-4 fill-emerald-300" />
              <span>Next Sector (Space / Enter)</span>
            </button>
          ) : (
            <button
              data-start="true"
              onClick={() => {
                sound.playClick();
                onExit();
              }}
              className="w-full py-3 px-4 rounded-xl border border-emerald-400 bg-emerald-950/50 text-emerald-200 font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-900/60 shadow-[0_0_20px_rgba(0,255,136,0.25)] transition"
            >
              <Home className="w-4 h-4" />
              <span>Title Menu (Space / Enter)</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onShare();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/30 text-fuchsia-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-fuchsia-900/40 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Victory</span>
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
