import React, { useEffect, useRef } from 'react';
import { GameMode, PlayerStats } from '../game/types';
import { sound } from '../game/audio';
import { Trophy, Calendar, Users, RefreshCw, Palette, Play } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';

interface TitleScreenProps {
  onStartGame: (mode: GameMode, level?: number) => void;
  onOpenLeaderboard: () => void;
  onOpenDaily: () => void;
  onOpenSync: () => void;
  onOpenThemes: () => void;
  stats: PlayerStats;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLeaderboard,
  onOpenDaily,
  onOpenSync,
  onOpenThemes,
  stats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background animated neon cyberspace matrix lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Floating neon block particles
    const blocks: {
      x: number;
      y: number;
      size: number;
      speed: number;
      rot: number;
      rotSpeed: number;
      color: string;
      alpha: number;
    }[] = [];

    const colors = ['#00f0ff', '#ff007f', '#00ff88', '#a855f7', '#ffb800'];
    for (let i = 0; i < 24; i++) {
      blocks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 16 + Math.random() * 28,
        speed: 0.3 + Math.random() * 0.7,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.12 + Math.random() * 0.18,
      });
    }

    let lastTime = performance.now();
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Cyber grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render floating isometric neon blocks
      blocks.forEach((b) => {
        b.y -= b.speed * 60 * dt;
        b.rot += b.rotSpeed * 60 * dt;
        if (b.y < -50) {
          b.y = height + 50;
          b.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.strokeStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = b.alpha;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-b.size / 2, -b.size / 2, b.size, b.size);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Keyboard shortcut listener: Space or Enter to quickly start Classic mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playClick();
        onStartGame('classic');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden bg-[#07080d] select-none text-slate-100">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Top Bar Utilities */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <OfflineIndicator />
          <PWAInstallButton compact />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-xs font-mono text-slate-300 hover:text-cyan-400 transition"
            aria-label="View Leaderboards"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Leaderboards</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSync();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-xs font-mono text-slate-300 hover:text-cyan-400 transition"
            aria-label="Cross-Platform Sync"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenThemes();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-magenta-500/50 hover:bg-fuchsia-950/30 text-xs font-mono text-slate-300 hover:text-fuchsia-400 transition"
            aria-label="Select Neon Theme"
          >
            <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="hidden sm:inline">Themes</span>
          </button>
        </div>
      </header>

      {/* Centerpiece Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto text-center">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="mb-2">
          <svg
            viewBox="0 0 600 120"
            className="w-[280px] sm:w-[440px] md:w-[540px] h-auto mx-auto filter drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            aria-label="NEON BLOK"
          >
            <defs>
              <linearGradient id="neonCyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#00ff88" />
              </linearGradient>
              <linearGradient id="neonMagentaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff007f" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Tech grid frame corners */}
            <path d="M 30 15 L 15 15 L 15 30" stroke="#00f0ff" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 570 15 L 585 15 L 585 30" stroke="#00f0ff" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 30 105 L 15 105 L 15 90" stroke="#ff007f" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 570 105 L 585 105 L 585 90" stroke="#ff007f" strokeWidth="2" fill="none" opacity="0.6" />

            {/* Glowing polyomino emblem */}
            <g transform="translate(60, 26)">
              <rect x="0" y="0" width="18" height="18" fill="#00f0ff" opacity="0.85" rx="2" />
              <rect x="22" y="0" width="18" height="18" fill="#00f0ff" opacity="0.85" rx="2" />
              <rect x="22" y="22" width="18" height="18" fill="#ff007f" opacity="0.85" rx="2" />
              <rect x="22" y="44" width="18" height="18" fill="#00ff88" opacity="0.85" rx="2" />
            </g>

            {/* Wordmark NEON BLOK */}
            <text
              x="130"
              y="74"
              fill="url(#neonCyanGrad)"
              fontFamily="Outfit, sans-serif"
              fontWeight="900"
              fontSize="64"
              letterSpacing="6"
              filter="url(#glowEffect)"
            >
              NEON
            </text>
            <text
              x="320"
              y="74"
              fill="url(#neonMagentaGrad)"
              fontFamily="Outfit, sans-serif"
              fontWeight="900"
              fontSize="64"
              letterSpacing="6"
              filter="url(#glowEffect)"
            >
              BLOK
            </text>

            <text
              x="132"
              y="100"
              fill="#94a3b8"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="600"
              fontSize="12"
              letterSpacing="3"
              opacity="0.8"
            >
              CYBERPUNK POLYOMINO PROTOCOL
            </text>
          </svg>
        </div>

        {/* Player Stats Ribbon */}
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 mb-8 mt-2">
          <div>
            <span className="text-slate-500">BEST:</span>{' '}
            <span className="text-cyan-400 font-bold tabular-nums">
              {stats.highScoreClassic.toLocaleString()}
            </span>
          </div>
          <span>·</span>
          <div>
            <span className="text-slate-500">STARS:</span>{' '}
            <span className="text-amber-400 font-bold tabular-nums">
              {Object.values(stats.campaignStars).reduce((a, b) => a + b, 0)}/90
            </span>
          </div>
          <span>·</span>
          <div>
            <span className="text-slate-500">STREAK:</span>{' '}
            <span className="text-emerald-400 font-bold tabular-nums">{stats.dailyStreak}d</span>
          </div>
        </div>

        {/* Primary Modes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-lg mb-6">
          {/* Classic Endless */}
          <button
            data-start="true"
            onClick={() => {
              sound.playClick();
              onStartGame('classic');
            }}
            className="group relative flex items-center justify-between p-4 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 to-slate-900/60 hover:from-cyan-950/70 hover:to-slate-900/90 hover:border-cyan-400 transition-all shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] text-left"
          >
            <div>
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400 group-hover:scale-110 transition-transform" />
                <h2 className="text-base font-bold text-white tracking-wide">Endless Mode</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">High-score infinite protocol</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">
              ENTER →
            </span>
          </button>

          {/* Campaign Level Progression */}
          <button
            onClick={() => {
              sound.playClick();
              onStartGame('campaign');
            }}
            className="group relative flex items-center justify-between p-4 rounded-xl border border-fuchsia-500/40 bg-gradient-to-r from-fuchsia-950/40 to-slate-900/60 hover:from-fuchsia-950/70 hover:to-slate-900/90 hover:border-fuchsia-400 transition-all shadow-[0_0_20px_rgba(255,0,127,0.15)] hover:shadow-[0_0_25px_rgba(255,0,127,0.3)] text-left"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center font-bold text-xs text-fuchsia-400">
                  ⚡
                </span>
                <h2 className="text-base font-bold text-white tracking-wide">Campaign Mode</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                30 levels with obstacles & bombs
              </p>
            </div>
            <span className="text-xs font-mono text-fuchsia-400 group-hover:translate-x-1 transition-transform">
              SELECT →
            </span>
          </button>

          {/* Daily Protocol */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenDaily();
            }}
            className="group relative flex items-center justify-between p-4 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 hover:from-emerald-950/70 hover:to-slate-900/90 hover:border-emerald-400 transition-all shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_25px_rgba(0,255,136,0.3)] text-left"
          >
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Daily Protocol</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Seeded puzzle & streak rewards
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 group-hover:translate-x-1 transition-transform">
              TODAY →
            </span>
          </button>

          {/* Local 2P Duel */}
          <button
            onClick={() => {
              sound.playClick();
              onStartGame('multiplayer');
            }}
            className="group relative flex items-center justify-between p-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-slate-900/60 hover:from-amber-950/70 hover:to-slate-900/90 hover:border-amber-400 transition-all shadow-[0_0_20px_rgba(255,184,0,0.15)] hover:shadow-[0_0_25px_rgba(255,184,0,0.3)] text-left"
          >
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Local 2P Duel</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Head-to-head split battle
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 group-hover:translate-x-1 transition-transform">
              DUEL →
            </span>
          </button>
        </div>
      </main>

      {/* Single Flat Control Hint Line */}
      <footer className="relative z-10 pb-6 text-center">
        <p className="text-xs font-mono text-slate-400 tracking-wider">
          Drag & Drop or Keys 1 · 2 · 3 to place · Esc Pause · M Mute
        </p>
      </footer>
    </div>
  );
};
