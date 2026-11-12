import React from 'react';
import { LevelConfig, PlayerStats } from '../game/types';
import { getCampaignLevels } from '../game/rules';
import { sound } from '../game/audio';
import { ArrowLeft, Star, Lock, Zap } from 'lucide-react';

interface CampaignMapProps {
  stats: PlayerStats;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const CampaignMap: React.FC<CampaignMapProps> = ({
  stats,
  onSelectLevel,
  onBack,
}) => {
  const levels = getCampaignLevels();
  const totalStars = Object.values(stats.campaignStars).reduce((a, b) => a + b, 0);

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#07080d] text-slate-100 overflow-hidden select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Title</span>
          </button>
          <h1 className="text-sm sm:text-base font-bold tracking-wider font-mono text-fuchsia-400 uppercase">
            Campaign Protocol // 30 Sectors
          </h1>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-amber-500/30 bg-amber-950/30 font-mono text-xs text-amber-300">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold tabular-nums">{totalStars}</span>
          <span className="text-slate-500">/90</span>
        </div>
      </header>

      {/* Grid of 30 levels */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {levels.map((lvl) => {
            const isUnlocked = lvl.level <= stats.unlockedLevel;
            const stars = stats.campaignStars[lvl.level] || 0;

            return (
              <button
                key={`lvl-${lvl.level}`}
                disabled={!isUnlocked}
                onClick={() => {
                  sound.playClick();
                  onSelectLevel(lvl.level);
                }}
                className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left ${
                  isUnlocked
                    ? 'border-slate-800 bg-slate-900/50 hover:border-fuchsia-500/60 hover:bg-fuchsia-950/20 hover:shadow-[0_0_20px_rgba(255,0,127,0.2)] cursor-pointer'
                    : 'border-slate-900 bg-slate-950/50 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Sector header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-fuchsia-300">
                    SEC 0{lvl.level < 10 ? '0' + lvl.level : lvl.level}
                  </span>
                  {!isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  ) : (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3 h-3 ${
                            starIdx <= stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Level details */}
                <div className="my-2.5">
                  <div className="text-[11px] text-slate-300 line-clamp-2">
                    {lvl.description}
                  </div>
                </div>

                {/* Score target badge */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-2">
                  <span>GOAL:</span>
                  <span className="text-fuchsia-400 font-bold tabular-nums">
                    {lvl.targetScore.toLocaleString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
