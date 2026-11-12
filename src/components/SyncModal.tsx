import React, { useState } from 'react';
import { PlayerStats } from '../game/types';
import { encodeSyncData, decodeSyncData } from '../game/rules';
import { sound } from '../game/audio';
import { X, RefreshCw, Copy, Check, Upload, Download, CloudCheck, AlertCircle } from 'lucide-react';

interface SyncModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  stats,
  onUpdateStats,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const syncCode = encodeSyncData(stats);

  const handleCopyCode = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleImport = () => {
    sound.playClick();
    if (!importCode.trim()) {
      setImportStatus({ success: false, message: 'Please enter a valid sync code.' });
      return;
    }

    const imported = decodeSyncData(importCode);
    if (!imported) {
      sound.playError();
      setImportStatus({
        success: false,
        message: 'Invalid or corrupted sync code. Checksum validation failed.',
      });
      return;
    }

    // Merge stats (take max of high scores, union of stars and completed days)
    const merged: PlayerStats = {
      gamesPlayed: Math.max(stats.gamesPlayed, imported.gamesPlayed),
      totalScore: Math.max(stats.totalScore, imported.totalScore),
      totalLinesCleared: Math.max(stats.totalLinesCleared, imported.totalLinesCleared),
      maxCombo: Math.max(stats.maxCombo, imported.maxCombo),
      unlockedLevel: Math.max(stats.unlockedLevel, imported.unlockedLevel),
      highScoreClassic: Math.max(stats.highScoreClassic, imported.highScoreClassic),
      dailyStreak: Math.max(stats.dailyStreak, imported.dailyStreak),
      lastDailyDate: stats.lastDailyDate || imported.lastDailyDate,
      dailyCompletedDates: Array.from(
        new Set([...stats.dailyCompletedDates, ...imported.dailyCompletedDates])
      ),
      campaignStars: { ...stats.campaignStars, ...imported.campaignStars },
      unlockedThemes: Array.from(
        new Set([...stats.unlockedThemes, ...imported.unlockedThemes])
      ),
      activeTheme: stats.activeTheme || imported.activeTheme,
    };

    onUpdateStats(merged);
    sound.playVictory();
    setImportStatus({
      success: true,
      message: 'Protocol progress synchronized successfully across devices!',
    });
    setImportCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-500/40 bg-[#0c1017] p-5 shadow-[0_0_35px_rgba(0,240,255,0.25)] text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold font-mono tracking-wider text-white uppercase">
              Cross-Platform Synchronization
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Sync Modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
          {/* Cloud Status Card */}
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff88]" />
              <span>Offline-First Engine Ready</span>
            </div>
            <span className="text-slate-400 text-[11px]">Synced Local DB</span>
          </div>

          {/* Export Box */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
                1. Export Sync Code
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Copy this secure key to restore your campaign levels, high scores, and streaks on another phone or computer.
            </p>
            <textarea
              readOnly
              value={syncCode}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[10px] text-slate-300 select-all resize-none focus:outline-none"
            />
          </div>

          {/* Import Box */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <span className="text-xs font-mono font-bold text-fuchsia-400 uppercase tracking-wide block mb-2">
              2. Import Sync Code
            </span>
            <p className="text-[11px] text-slate-400 mb-2">
              Paste a key from another device to merge your unlocked levels and achievements:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste sync code here..."
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-fuchsia-500"
              />
              <button
                onClick={handleImport}
                className="px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-[0_0_12px_rgba(255,0,127,0.3)] shrink-0"
              >
                Import
              </button>
            </div>

            {/* Import feedback */}
            {importStatus && (
              <div
                className={`mt-2.5 p-2 rounded-lg text-[11px] font-mono flex items-center gap-1.5 ${
                  importStatus.success
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/60 border border-red-500/40 text-red-300'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
