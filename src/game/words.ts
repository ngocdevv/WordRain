/**
 * Word bank & entity management for Word Rain.
 * Uses object pooling to avoid GC spikes during gameplay.
 */

import { LAYOUT, WORD_BOX, WORD_CONFIG } from './game-config';

// ── Word Bank ──────────────────────────────────────────────
// Grouped by difficulty tier (character length)

const TIER_1 = [
    'cat', 'dog', 'sun', 'run', 'fly', 'red', 'key', 'cup', 'pen', 'box',
    'map', 'ice', 'hot', 'win', 'top', 'big', 'fix', 'joy', 'ink', 'fog',
    'net', 'jam', 'gem', 'owl', 'pie', 'hug', 'zip', 'wax', 'dim', 'cub',
];

const TIER_2 = [
    'code', 'rain', 'fire', 'word', 'game', 'star', 'moon', 'tree', 'wave',
    'dark', 'fast', 'gold', 'mint', 'love', 'cool', 'jump', 'swim', 'glow',
    'snap', 'buzz', 'grid', 'flow', 'peak', 'dawn', 'echo', 'lamp', 'silk',
    'iron', 'jazz', 'reef', 'palm', 'fuse', 'lynx', 'myth', 'ruby', 'vibe',
];

const TIER_3 = [
    'pixel', 'ocean', 'dream', 'light', 'storm', 'swift', 'power', 'brain',
    'flame', 'cloud', 'laser', 'music', 'royal', 'urban', 'blaze', 'ghost',
    'chill', 'shine', 'frost', 'bloom', 'pulse', 'eagle', 'charm', 'ridge',
    'vapor', 'quest', 'orbit', 'prism', 'nexus', 'delta', 'crane', 'forge',
];

const TIER_4 = [
    'galaxy', 'dragon', 'rocket', 'sunset', 'python', 'stream', 'engine',
    'throne', 'cipher', 'harbor', 'canyon', 'arctic', 'beacon', 'radiant',
    'velvet', 'matrix', 'nebula', 'meteor', 'zenith', 'shadow', 'crystal',
    'turbo', 'comet', 'plasma', 'jungle', 'falcon', 'magnet', 'signal',
];

const TIER_5 = [
    'thunder', 'phoenix', 'quantum', 'gravity', 'tornado', 'diamond',
    'horizon', 'volcano', 'eclipse', 'neon', 'cyborg', 'nebulas',
    'whisper', 'odyssey', 'fantasy', 'pioneer', 'circuit', 'digital',
    'network', 'typhoon', 'miracle', 'crimson', 'emerald', 'mammoth',
    'internet', 'keyboard', 'spectrum', 'catalyst', 'magnetic', 'titanium',
];

const TIERS = [TIER_1, TIER_2, TIER_3, TIER_4, TIER_5];

// ── Word Entity ────────────────────────────────────────────

export interface WordEntity {
    id: number;
    text: string;
    x: number;
    y: number;
    speed: number;
    width: number;
    height: number;
    active: boolean;
    matched: boolean;
    /** How many characters have been typed correctly so far */
    matchedChars: number;
    /** Timestamp (ms) when word was matched — drives exit animation */
    matchedTime: number;
    /** Index into the color palette (0–5) */
    colorIndex: number;
}

export const PALETTE_SIZE = 6;

// ── Object Pool ────────────────────────────────────────────

let nextId = 0;

function createEmptyWord(): WordEntity {
    return {
        id: nextId++,
        text: '',
        x: 0,
        y: 0,
        speed: 0,
        width: 0,
        height: 0,
        active: false,
        matched: false,
        matchedChars: 0,
        matchedTime: 0,
        colorIndex: 0,
    };
}

const pool: WordEntity[] = [];
for (let i = 0; i < WORD_CONFIG.MAX_ACTIVE_WORDS * 2; i++) {
    pool.push(createEmptyWord());
}

function acquireWord(): WordEntity {
    const inactive = pool.find((w) => !w.active);
    if (inactive) return inactive;
    const newWord = createEmptyWord();
    pool.push(newWord);
    return newWord;
}

export function releaseWord(word: WordEntity) {
    word.active = false;
    word.matched = false;
    word.matchedChars = 0;
    word.matchedTime = 0;
}

// ── Helpers ────────────────────────────────────────────────

/** Pick a random word appropriate for the given level */
function pickWord(level: number): string {
    // Higher levels unlock harder tiers
    const maxTier = Math.min(level, TIERS.length) - 1;
    // Weighted toward current tier
    const tierIndex =
        Math.random() < 0.6
            ? maxTier
            : Math.floor(Math.random() * (maxTier + 1));
    const tier = TIERS[tierIndex];
    return tier[Math.floor(Math.random() * tier.length)].toUpperCase();
}

/** Estimate word box width (rough — refined when Skia measures font) */
function estimateWidth(text: string): number {
    return text.length * (WORD_BOX.FONT_SIZE * 0.7) + WORD_BOX.PADDING_X * 2;
}

/** Spawn a new WordEntity ready for the game */
export function spawnWord(
    level: number,
    screenWidth: number,
): WordEntity {
    const word = acquireWord();
    word.text = pickWord(level);
    word.width = estimateWidth(word.text);
    word.height = WORD_BOX.FONT_SIZE + WORD_BOX.PADDING_Y * 2;

    const minX = LAYOUT.HORIZONTAL_PADDING;
    const maxX = screenWidth - word.width - LAYOUT.HORIZONTAL_PADDING;
    word.x = minX + Math.random() * (maxX - minX);
    word.y = -word.height; // start above visible area

    word.speed =
        WORD_CONFIG.BASE_SPEED + WORD_CONFIG.SPEED_PER_LEVEL * (level - 1);
    word.active = true;
    word.matched = false;
    word.matchedChars = 0;
    word.matchedTime = 0;
    word.colorIndex = Math.floor(Math.random() * PALETTE_SIZE);
    word.id = nextId++;

    return word;
}

/** Get all currently active words from the pool */
export function getActiveWords(): WordEntity[] {
    return pool.filter((w) => w.active);
}

/** Reset the entire pool (new game) */
export function resetPool() {
    pool.forEach((w) => {
        w.active = false;
        w.matched = false;
        w.matchedChars = 0;
        w.matchedTime = 0;
    });
}
