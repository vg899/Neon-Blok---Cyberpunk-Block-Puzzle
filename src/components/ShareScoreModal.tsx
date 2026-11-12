import React, { useRef, useEffect, useState } from 'react';
import { sound } from '../game/audio';
import { X, Share2, Download, Copy, Check, Twitter, MessageCircle } from 'lucide-react';

interface ShareScoreModalProps {
  score: number;
  lines: number;
  combo: number;
  mode: string;
  onClose: () => void;
}

export const ShareScoreModal: React.FC<ShareScoreModalProps> = ({
  score,
  lines,
  combo,
  mode,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [canWebShare, setCanWebShare] = useState(false);

  const shareText = `⚡ I just achieved ${score.toLocaleString()} points and cleared ${lines} lines in NEON BLOK (${mode.toUpperCase()})! Can you beat my record? #NeonBlok #CyberpunkPuzzle`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://neonblok.game';

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setCanWebShare(true);
    }
  }, []);

  // Render high-res Neon Share Card on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card dimensions
    canvas.width = 700;
    canvas.height = 420;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 700, 420);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(0.5, '#07080d');
    bgGrad.addColorStop(1, '#0e121c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 700, 420);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 700; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 420);
      ctx.stroke();
    }
    for (let y = 0; y < 420; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(700, y);
      ctx.stroke();
    }

    // Outer Neon Border
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(20, 20, 660, 380);

    // Corner brackets
    ctx.strokeStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 4;
    // TL
    ctx.beginPath();
    ctx.moveTo(15, 45);
    ctx.lineTo(15, 15);
    ctx.lineTo(45, 15);
    ctx.stroke();
    // TR
    ctx.beginPath();
    ctx.moveTo(655, 15);
    ctx.lineTo(685, 15);
    ctx.lineTo(685, 45);
    ctx.stroke();
    // BR
    ctx.beginPath();
    ctx.moveTo(685, 375);
    ctx.lineTo(685, 405);
    ctx.lineTo(655, 405);
    ctx.stroke();
    // BL
    ctx.beginPath();
    ctx.moveTo(45, 405);
    ctx.lineTo(15, 405);
    ctx.lineTo(15, 375);
    ctx.stroke();

    // Brand Header
    ctx.shadowBlur = 0;
    ctx.font = '900 32px Outfit, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('NEON BLOK', 50, 70);

    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ff007f';
    ctx.fillText(`// PROTOCOL PROTO-RECORD · ${mode.toUpperCase()}`, 250, 68);

    // Main Score Display
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('TERMINAL SCORE RECORD', 50, 140);

    ctx.font = '900 78px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 25;
    ctx.fillText(score.toLocaleString(), 50, 220);

    // Metrics Row (Lines, Max Combo, Date)
    ctx.shadowBlur = 0;
    // Lines
    ctx.fillStyle = '#64748b';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText('LINES CLEARED', 50, 280);
    ctx.fillStyle = '#00ff88';
    ctx.font = '700 28px "JetBrains Mono", monospace';
    ctx.fillText(`${lines}`, 50, 315);

    // Combo
    ctx.fillStyle = '#64748b';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText('PEAK COMBO', 240, 280);
    ctx.fillStyle = '#ffb800';
    ctx.font = '700 28px "JetBrains Mono", monospace';
    ctx.fillText(`${combo}x`, 240, 315);

    // Date
    ctx.fillStyle = '#64748b';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText('LOG TIMESTAMP', 430, 280);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 430, 312);

    // Bottom Watermark
    ctx.fillStyle = '#475569';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText('VERIFIED CYBER LOG · AI STUDIO HIGH ACCEL · PLAY AT NEONBLOK.GAME', 50, 375);
  }, [score, lines, combo, mode]);

  const handleCopyText = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadImage = () => {
    sound.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `neon-blok-score-${score}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleWebShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Neon Blok High Score Record',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User dismissed
      }
    }
  };

  const handleShareTwitter = () => {
    sound.playClick();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    sound.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-[#0c1017] p-5 shadow-[0_0_40px_rgba(0,240,255,0.3)] text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold font-mono tracking-wider text-white uppercase">
              Share Score Matrix
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Share Modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Canvas Preview */}
        <div className="my-4 rounded-xl overflow-hidden border border-slate-800/80 bg-black flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[220px] object-contain"
          />
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs mb-3">
          {/* Download Image */}
          <button
            onClick={handleDownloadImage}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-700 bg-slate-900 hover:border-cyan-500 hover:text-cyan-300 transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Save Image</span>
          </button>

          {/* Twitter / X */}
          <button
            onClick={handleShareTwitter}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-700 bg-slate-900 hover:border-sky-500 hover:text-sky-300 transition"
          >
            <Twitter className="w-3.5 h-3.5 text-sky-400" />
            <span>Twitter / X</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-700 bg-slate-900 hover:border-emerald-500 hover:text-emerald-300 transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          {/* Copy Link / Text */}
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-700 bg-slate-900 hover:border-fuchsia-500 hover:text-fuchsia-300 transition"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-fuchsia-400" />
            )}
            <span>{copied ? 'Copied!' : 'Copy Post'}</span>
          </button>
        </div>

        {/* Native Web Share Button (if supported) */}
        {canWebShare && (
          <button
            onClick={handleWebShare}
            className="w-full py-2.5 px-4 rounded-xl border border-cyan-400 bg-cyan-950/50 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via Device System</span>
          </button>
        )}
      </div>
    </div>
  );
};
