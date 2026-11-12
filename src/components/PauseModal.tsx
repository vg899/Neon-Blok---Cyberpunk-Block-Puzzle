import React, { useEffect } from 'react';
import { sound } from '../game/audio';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onExit,
}) => {
  // Listen for Esc or Space or P to resume
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP' || e.code === 'Space') {
        e.preventDefault();
        sound.playClick();
        onResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-xs rounded-2xl border border-cyan-500/40 bg-[#0d111a] p-6 text-center shadow-[0_0_35px_rgba(0,240,255,0.25)] text-slate-100">
        <h2 className="text-xl font-bold font-mono text-cyan-300 tracking-wider uppercase mb-1">
          PROTOCOL PAUSED
        </h2>
        <p className="text-xs font-mono text-slate-400 mb-6">
          Press Esc, Space or P to resume
        </p>

        <div className="space-y-2.5 font-mono text-xs">
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-cyan-400 bg-cyan-950/50 text-cyan-200 font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(0,240,255,0.2)] transition"
          >
            <Play className="w-4 h-4 fill-cyan-300" />
            <span>Resume</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-2 px-4 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
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
