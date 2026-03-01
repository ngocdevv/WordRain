/**
 * Game balance constants for Word Rain.
 * Tuning these values changes difficulty progression.
 */

/** Screen layout ratios (relative to screen dimensions) */
export const LAYOUT = {
    /** Top padding before words can spawn (fraction of height) */
    SPAWN_Y: 0,
    /** Bottom line — if word passes this, it's a miss (fraction of canvas height) */
    DEATH_LINE: 0.94,
    /** Horizontal padding from screen edges */
    HORIZONTAL_PADDING: 24,
} as const;

/** Word spawning & movement */
export const WORD_CONFIG = {
    /** Base fall speed in px/sec at level 1 */
    BASE_SPEED: 40,
    /** Additional speed per level (px/sec) */
    SPEED_PER_LEVEL: 8,
    /** Max simultaneous words on screen */
    MAX_ACTIVE_WORDS: 6,
    /** Min interval between spawns (ms) */
    MIN_SPAWN_INTERVAL: 800,
    /** Max interval between spawns at level 1 (ms) */
    BASE_SPAWN_INTERVAL: 2500,
    /** Spawn interval reduction per level (ms) */
    SPAWN_INTERVAL_REDUCTION: 150,
} as const;

/** Level progression */
export const LEVEL_CONFIG = {
    /** Words to complete per level */
    WORDS_PER_LEVEL: 10,
    /** Max reachable level */
    MAX_LEVEL: 20,
} as const;

/** Scoring */
export const SCORE_CONFIG = {
    /** Base points per word */
    BASE_POINTS: 100,
    /** Bonus points per character in word */
    POINTS_PER_CHAR: 10,
    /** Max combo multiplier */
    MAX_COMBO_MULTIPLIER: 8,
    /** Seconds of inactivity before combo resets */
    COMBO_TIMEOUT: 5,
} as const;

/** Player lives */
export const LIVES_CONFIG = {
    /** Starting lives */
    INITIAL_LIVES: 5,
    /** Max lives attainable */
    MAX_LIVES: 5,
} as const;

/** Particle system */
export const PARTICLE_CONFIG = {
    /** Particles spawned per word completion */
    BURST_COUNT: 12,
    /** Particle pool size (pre-allocated) */
    POOL_SIZE: 60,
    /** Particle lifetime in seconds */
    LIFETIME: 0.8,
    /** Max particle spread radius */
    SPREAD_RADIUS: 80,
    /** Particle size range [min, max] */
    SIZE_RANGE: [3, 7] as [number, number],
} as const;

/** Visual sizing */
export const WORD_BOX = {
    /** Vertical padding inside word box */
    PADDING_Y: 10,
    /** Horizontal padding inside word box */
    PADDING_X: 16,
    /** Border radius */
    BORDER_RADIUS: 12,
    /** Font size for word text */
    FONT_SIZE: 18,
} as const;
