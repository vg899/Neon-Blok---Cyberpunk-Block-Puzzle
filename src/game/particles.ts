/**
 * High-performance pooled particle system for Neon Blok
 * Emits neon spark bursts, expanding shockwave rings, and floating floating score labels.
 */

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'ring' | 'text';
  text?: string;
  radius?: number;
  maxRadius?: number;
}

const POOL_SIZE = 150;

export class ParticlePool {
  private particles: Particle[] = [];

  constructor() {
    for (let i = 0; i < POOL_SIZE; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: '#00f0ff',
        alpha: 1,
        decay: 0.02,
        type: 'spark',
      });
    }
  }

  /**
   * Spawns a burst of neon sparks and a shockwave ring at (x, y)
   */
  public emitBurst(x: number, y: number, color = '#00f0ff', count = 16) {
    // Spawn ring
    this.spawnRing(x, y, color);

    // Spawn sparks
    let spawned = 0;
    for (const p of this.particles) {
      if (!p.active) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        p.active = true;
        p.type = 'spark';
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.size = 2 + Math.random() * 3.5;
        p.color = color;
        p.alpha = 1;
        p.decay = 0.02 + Math.random() * 0.03;
        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  /**
   * Spawns expanding neon shockwave
   */
  public spawnRing(x: number, y: number, color = '#00f0ff') {
    for (const p of this.particles) {
      if (!p.active) {
        p.active = true;
        p.type = 'ring';
        p.x = x;
        p.y = y;
        p.radius = 4;
        p.maxRadius = 35 + Math.random() * 20;
        p.color = color;
        p.alpha = 0.9;
        p.decay = 0.04;
        break;
      }
    }
  }

  /**
   * Spawns floating score text
   */
  public emitFloatingText(x: number, y: number, text: string, color = '#00f0ff') {
    for (const p of this.particles) {
      if (!p.active) {
        p.active = true;
        p.type = 'text';
        p.x = x;
        p.y = y;
        p.vx = 0;
        p.vy = -1.2;
        p.color = color;
        p.alpha = 1;
        p.decay = 0.025;
        p.text = text;
        break;
      }
    }
  }

  /**
   * Updates all active particles with clamped dt
   */
  public update(dt: number) {
    const clampedDt = Math.min(dt, 0.05);
    const step = clampedDt * 60; // normalize to 60fps

    for (const p of this.particles) {
      if (!p.active) continue;

      if (p.type === 'spark') {
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= p.decay * step;
      } else if (p.type === 'ring') {
        p.radius = (p.radius || 4) + 2.5 * step;
        p.alpha -= p.decay * step;
      } else if (p.type === 'text') {
        p.y += p.vy * step;
        p.alpha -= p.decay * step;
      }

      if (p.alpha <= 0) {
        p.active = false;
      }
    }
  }

  /**
   * Renders particles to canvas
   */
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      if (!p.active) continue;

      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius || 10, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'text' && p.text) {
        ctx.font = 'bold 15px "JetBrains Mono", monospace';
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      }
    }
    ctx.restore();
  }
}
