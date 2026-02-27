/**
 * GPU-friendly particle system for word-completion burst effects.
 * Pre-allocates a pool of particles and reuses them on each burst.
 */

import { PARTICLE_CONFIG } from './game-config';

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    life: number;
    maxLife: number;
    active: boolean;
    /** Color as RGB array for Skia */
    r: number;
    g: number;
    b: number;
}

// ── Neon color palette for particles ───────────────────────
const COLORS = [
    { r: 168, g: 85, b: 247 },  // purple
    { r: 236, g: 72, b: 153 },  // pink
    { r: 139, g: 92, b: 246 },  // violet
    { r: 59, g: 130, b: 246 },  // blue
    { r: 251, g: 146, b: 60 },  // orange
    { r: 250, g: 204, b: 21 },  // gold
];

// ── Pool ───────────────────────────────────────────────────

const pool: Particle[] = [];

for (let i = 0; i < PARTICLE_CONFIG.POOL_SIZE; i++) {
    pool.push({
        x: 0, y: 0, vx: 0, vy: 0,
        radius: 0, opacity: 0,
        life: 0, maxLife: 0,
        active: false,
        r: 0, g: 0, b: 0,
    });
}

// ── API ────────────────────────────────────────────────────

/** Emit a burst of particles from position (cx, cy) */
export function emitBurst(cx: number, cy: number) {
    let spawned = 0;
    for (let i = 0; i < pool.length && spawned < PARTICLE_CONFIG.BURST_COUNT; i++) {
        const p = pool[i];
        if (p.active) continue;

        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 120;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        p.x = cx;
        p.y = cy;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 40; // slight upward bias
        p.radius =
            PARTICLE_CONFIG.SIZE_RANGE[0] +
            Math.random() * (PARTICLE_CONFIG.SIZE_RANGE[1] - PARTICLE_CONFIG.SIZE_RANGE[0]);
        p.opacity = 1;
        p.life = 0;
        p.maxLife = PARTICLE_CONFIG.LIFETIME * (0.6 + Math.random() * 0.4);
        p.active = true;
        p.r = color.r;
        p.g = color.g;
        p.b = color.b;
        spawned++;
    }
}

/** Update all active particles. Call once per frame with dt in seconds. */
export function updateParticles(dt: number) {
    for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.active) continue;

        p.life += dt;
        if (p.life >= p.maxLife) {
            p.active = false;
            continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt; // gravity
        p.opacity = 1 - p.life / p.maxLife;
        p.radius *= 0.995; // slow shrink
    }
}

/** Get all currently active particles (for rendering) */
export function getActiveParticles(): readonly Particle[] {
    return pool.filter((p) => p.active);
}

/** Reset all particles (new game) */
export function resetParticles() {
    for (let i = 0; i < pool.length; i++) {
        pool[i].active = false;
    }
}
