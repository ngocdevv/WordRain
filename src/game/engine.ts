/**
 * Core game loop for Word Rain.
 * Manages word spawning, movement, collision, and input matching.
 * Designed to be called from Skia's useFrameCallback.
 */

import { useGameStore } from '../stores/game-store';
import { LAYOUT, WORD_CONFIG } from './game-config';
import { emitBurst, resetParticles, updateParticles } from './particles';
import { getActiveWords, releaseWord, resetPool, spawnWord } from './words';

let lastSpawnTime = 0;
let lastFrameTime = 0;

/** Initialize / reset the engine for a new game */
export function initEngine() {
    lastSpawnTime = 0;
    lastFrameTime = 0;
    resetPool();
    resetParticles();
}

/** Get the spawn interval for the current level */
function getSpawnInterval(level: number): number {
    const interval =
        WORD_CONFIG.BASE_SPAWN_INTERVAL -
        WORD_CONFIG.SPAWN_INTERVAL_REDUCTION * (level - 1);
    return Math.max(interval, WORD_CONFIG.MIN_SPAWN_INTERVAL);
}

/**
 * Main tick function — call every frame.
 * @param now - timestamp in ms (from useFrameCallback)
 * @param screenWidth - current screen width for spawn positioning
 * @param screenHeight - current screen height for death line
 */
export function tick(now: number, screenWidth: number, screenHeight: number) {
    const store = useGameStore.getState();
    if (store.gameStatus !== 'playing') return;

    // Delta time in seconds
    const dt = lastFrameTime === 0 ? 1 / 60 : (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    // Cap dt to prevent huge jumps (e.g. after backgrounding)
    const clampedDt = Math.min(dt, 0.1);

    const { level } = store;
    const activeWords = getActiveWords();
    const deathLineY = screenHeight * LAYOUT.DEATH_LINE;

    // ── Spawn words ──────────────────────────────────────────
    if (
        activeWords.length < WORD_CONFIG.MAX_ACTIVE_WORDS &&
        now - lastSpawnTime > getSpawnInterval(level)
    ) {
        spawnWord(level, screenWidth);
        lastSpawnTime = now;
    }

    // ── Move words ───────────────────────────────────────────
    const currentActive = getActiveWords();
    for (let i = 0; i < currentActive.length; i++) {
        const word = currentActive[i];

        // Matched words: freeze in place, release after exit animation (300ms)
        if (word.matched) {
            if (now - word.matchedTime > 300) {
                releaseWord(word);
            }
            continue;
        }

        word.y += word.speed * clampedDt;

        // Check death line
        if (word.y > deathLineY) {
            releaseWord(word);
            store.missWord();
        }
    }

    // ── Update particles ─────────────────────────────────────
    updateParticles(clampedDt);
}

/**
 * Update partial match highlights in real-time as user types.
 * Called on every keystroke from handleTextChange.
 */
export function updatePartialMatch(typedText: string) {
    const activeWords = getActiveWords();
    const upperTyped = typedText.toUpperCase();

    for (const word of activeWords) {
        if (word.matched) continue;
        if (upperTyped && word.text.startsWith(upperTyped)) {
            word.matchedChars = upperTyped.length;
        } else {
            word.matchedChars = 0;
        }
    }
}

/**
 * Process typed input against active words.
 * Returns true if a word was completed.
 */
export function processInput(typedText: string): {
    completed: boolean;
    wordText?: string;
    wordX?: number;
    wordY?: number;
} {
    if (!typedText) return { completed: false };

    const activeWords = getActiveWords();
    const upperTyped = typedText.toUpperCase();

    // Check for exact match (word completed)
    for (const word of activeWords) {
        if (word.text === upperTyped) {
            // Word completed!
            const cx = word.x + word.width / 2;
            const cy = word.y + word.height / 2;

            emitBurst(cx, cy);
            word.matched = true;
            word.matchedTime = performance.now();

            // Update store
            useGameStore.getState().completeWord(word.text);

            return { completed: true, wordText: word.text, wordX: cx, wordY: cy };
        }
    }

    return { completed: false };
}
