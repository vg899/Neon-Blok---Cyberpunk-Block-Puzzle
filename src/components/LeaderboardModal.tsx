import React, { useState } from 'react';
import { getMergedLeaderboard } from '../game/storage';
import { sound } from '../game/audio';
import { X, Trophy, Globe, Flame, User } from 'lucide-react';

interface LeaderboardModalProps {
  playerHighScore: number;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  playerHighScore,
  onClose,
}) => {
  const [tab, setTab] = useState<'global' | 'daily' | 'local'>('global');
  const entries = getMergedLeaderboard(playerHighScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-[#0c1017] p-5 shadow-[0_0_35px_rgba(0,240,255,0.25)] text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold font-mono tracking-wider text-white uppercase">
              Global Cyber Leaderboards
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Leaderboard Modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl my-3 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => {
              sound.playClick();
              setTab('global');
            }}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'global'
                ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All-Time Global</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('daily');
            }}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'daily'
                ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Daily Sprint</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('local');
            }}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'local'
                ? 'bg-fuchsia-950 border border-fuchsia-500/50 text-fuchsia-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Records</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
          <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-mono text-slate-500 uppercase">
            <span className="col-span-2">RANK</span>
            <span className="col-span-5">OPERATOR</span>
            <span className="col-span-2 text-right">LINES</span>
            <span className="col-span-3 text-right">SCORE</span>
          </div>

          {entries.map((entry) => {
            const isTop3 = entry.rank <= 3;
            return (
              <div
                key={`${entry.name}-${entry.rank}`}
                className={`grid grid-cols-12 items-center px-3 py-2 rounded-xl text-xs font-mono transition border ${
                  entry.isPlayer
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'border-slate-800/80 bg-slate-900/40 text-slate-300 hover:bg-slate-900/80'
                }`}
              >
                {/* Rank */}
                <div className="col-span-2 flex items-center gap-1">
                  <span
                    className={`font-bold tabular-nums ${
                      entry.rank === 1
                        ? 'text-amber-400'
                        : entry.rank === 2
                        ? 'text-slate-300'
                        : entry.rank === 3
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}
                  >
                    #{entry.rank}
                  </span>
                </div>

                {/* Name */}
                <div className="col-span-5 flex items-center gap-2 truncate">
                  <span className="font-semibold text-white truncate">
                    {entry.name}
                  </span>
                  {entry.isPlayer && (
                    <span className="px-1 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                      YOU
                    </span>
                  )}
                </div>

                {/* Lines */}
                <div className="col-span-2 text-right text-slate-400 tabular-nums">
                  {entry.lines}
                </div>

                {/* Score */}
                <div className="col-span-3 text-right font-bold text-cyan-400 tabular-nums">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800/80 mt-3 text-center">
          <p className="text-[11px] font-mono text-slate-500">
            Scores update in real time with local and global cloud synchronization.
          </p>
        </div>
      </div>
    </div>
  );
};
