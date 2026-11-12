import React from 'react';
import { PlayerStats } from '../game/types';
import { generateDailyChallenge } from '../game/rules';
import { sound } from '../game/audio';
import { ArrowLeft, Calendar, Flame, CheckCircle2, Play, Award } from 'lucide-react';

interface DailyChallengeViewProps {
  stats: PlayerStats;
  onStartDaily: () => void;
  onBack: () => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  stats,
  onStartDaily,
  onBack,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedToday = stats.dailyCompletedDates.includes(todayStr);
  const dailyConfig = generateDailyChallenge(todayStr);

  // Generate the last 7 days for the weekly streak tracker
  const daysList: { date: string; dayLabel: string; completed: boolean; isToday: boolean }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    daysList.push({
      date: dStr,
      dayLabel,
      completed: stats.dailyCompletedDates.includes(dStr),
      isToday: dStr === todayStr,
    });
  }

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#07080d] text-slate-100 overflow-hidden select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 max-w-4xl mx-auto w-full">
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

        <div className="flex items-center gap-2 font-mono text-xs">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            Daily Protocol Matrix
          </span>
        </div>

        <div className="flex items-center gap-1 px-3 py-1 rounded-lg border border-emerald-500/30 bg-emerald-950/30 font-mono text-xs text-emerald-300">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-bold tabular-nums">{stats.dailyStreak}</span>
          <span className="text-slate-500">Day Streak</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-8 max-w-2xl mx-auto w-full flex flex-col justify-center">
        {/* Streak Calendar Row */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 mb-6">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-slate-400">Weekly Consistency</span>
            <span className="text-emerald-400 font-bold">
              {stats.dailyCompletedDates.length} Protocols Solved
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysList.map((day) => (
              <div
                key={day.date}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  day.completed
                    ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(0,255,136,0.2)]'
                    : day.isToday
                    ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300 ring-1 ring-cyan-500/40'
                    : 'border-slate-800/60 bg-slate-950/40 text-slate-600'
                }`}
              >
                <span className="text-[10px] font-mono uppercase">{day.dayLabel}</span>
                <div className="my-1">
                  {day.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700 block mx-auto" />
                  )}
                </div>
                <span className="text-[9px] font-mono text-slate-500">
                  {day.date.split('-')[2]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Mission Card */}
        <div className="relative p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-slate-900/60 shadow-[0_0_30px_rgba(0,255,136,0.15)] text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/60 text-emerald-400 text-xs font-mono font-bold uppercase mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>PROTOCOL FOR {todayStr}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold font-mono text-white tracking-wide mb-2">
            {dailyConfig.name}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6">
            {dailyConfig.description}
          </p>

          {/* Mission parameters */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6 font-mono text-xs">
            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-500 block">TARGET</span>
              <span className="text-sm font-bold text-cyan-400 tabular-nums">
                {dailyConfig.targetScore.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-500 block">MOVES</span>
              <span className="text-sm font-bold text-amber-400 tabular-nums">
                {dailyConfig.moveLimit}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-500 block">LINES</span>
              <span className="text-sm font-bold text-emerald-400 tabular-nums">
                {dailyConfig.targetLines}
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              sound.playClick();
              onStartDaily();
            }}
            className="w-full max-w-xs mx-auto py-3 px-6 rounded-xl border border-emerald-400 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.3)] transition"
          >
            <Play className="w-4 h-4 fill-emerald-300" />
            <span>{isCompletedToday ? 'Replay Protocol' : 'Deploy Protocol'}</span>
          </button>
        </div>
      </main>
    </div>
  );
};
