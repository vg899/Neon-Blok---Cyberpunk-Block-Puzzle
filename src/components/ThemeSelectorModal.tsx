import React from 'react';
import { NeonThemeId, PlayerStats } from '../game/types';
import { NEON_THEMES } from '../game/pieces';
import { sound } from '../game/audio';
import { X, Palette, Check, Lock } from 'lucide-react';

interface ThemeSelectorModalProps {
  stats: PlayerStats;
  onSelectTheme: (themeId: NeonThemeId) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  stats,
  onSelectTheme,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-md rounded-2xl border border-fuchsia-500/40 bg-[#0c1017] p-5 shadow-[0_0_35px_rgba(255,0,127,0.25)] text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-fuchsia-400" />
            <h2 className="text-base font-bold font-mono tracking-wider text-white uppercase">
              Neon Chromatic Themes
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Theme Modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of themes */}
        <div className="py-4 space-y-2.5">
          {Object.values(NEON_THEMES).map((theme) => {
            const isSelected = stats.activeTheme === theme.id;
            const isUnlocked = stats.unlockedThemes.includes(theme.id as NeonThemeId);

            return (
              <button
                key={theme.id}
                disabled={!isUnlocked}
                onClick={() => {
                  sound.playClick();
                  onSelectTheme(theme.id as NeonThemeId);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-fuchsia-400 bg-fuchsia-950/40 shadow-[0_0_15px_rgba(255,0,127,0.25)]'
                    : isUnlocked
                    ? 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
                    : 'border-slate-900 bg-slate-950/40 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color preview dots */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: theme.secondary }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white">{theme.name}</h3>
                    <p className="text-[10px] text-slate-400">
                      {isUnlocked ? 'Unlocked & Calibrated' : 'Unlocked at Sector 10 / Streak'}
                    </p>
                  </div>
                </div>

                <div>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-fuchsia-400" />
                  ) : !isUnlocked ? (
                    <Lock className="w-4 h-4 text-slate-600" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
