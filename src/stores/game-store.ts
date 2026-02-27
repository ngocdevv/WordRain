/**
 * Zustand store for Word Rain game state.
 * Skia reads via getState() — zero re-renders on the game loop.
 * React components use hooks for HUD updates.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { LEVEL_CONFIG, LIVES_CONFIG, SCORE_CONFIG } from '../game/game-config';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

interface GameState {
    // ── State ─────────────────────────────
    gameStatus: GameStatus;
    score: number;
    level: number;
    combo: number;
    multiplier: number;
    lives: number;
    wordsCompleted: number;
    wordsInLevel: number;
    totalWordsCompleted: number;

    // ── Actions ───────────────────────────
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    completeWord: (word: string) => void;
    missWord: () => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        gameStatus: 'idle',
        score: 0,
        level: 1,
        combo: 0,
        multiplier: 1,
        lives: LIVES_CONFIG.INITIAL_LIVES,
        wordsCompleted: 0,
        wordsInLevel: 0,
        totalWordsCompleted: 0,

        startGame: () =>
            set({
                gameStatus: 'playing',
                score: 0,
                level: 1,
                combo: 0,
                multiplier: 1,
                lives: LIVES_CONFIG.INITIAL_LIVES,
                wordsCompleted: 0,
                wordsInLevel: 0,
                totalWordsCompleted: 0,
            }),

        pauseGame: () => set({ gameStatus: 'paused' }),

        resumeGame: () => set({ gameStatus: 'playing' }),

        completeWord: (word: string) => {
            const state = get();
            const newCombo = state.combo + 1;
            const newMultiplier = Math.min(
                Math.floor(newCombo / 2) + 1,
                SCORE_CONFIG.MAX_COMBO_MULTIPLIER,
            );

            const points =
                (SCORE_CONFIG.BASE_POINTS + word.length * SCORE_CONFIG.POINTS_PER_CHAR) *
                newMultiplier;

            const wordsInLevel = state.wordsInLevel + 1;
            const shouldLevelUp = wordsInLevel >= LEVEL_CONFIG.WORDS_PER_LEVEL;

            set({
                score: state.score + points,
                combo: newCombo,
                multiplier: newMultiplier,
                wordsCompleted: state.wordsCompleted + 1,
                totalWordsCompleted: state.totalWordsCompleted + 1,
                wordsInLevel: shouldLevelUp ? 0 : wordsInLevel,
                level: shouldLevelUp
                    ? Math.min(state.level + 1, LEVEL_CONFIG.MAX_LEVEL)
                    : state.level,
            });
        },

        missWord: () => {
            const state = get();
            const newLives = state.lives - 1;

            set({
                lives: newLives,
                combo: 0,
                multiplier: 1,
                gameStatus: newLives <= 0 ? 'gameover' : state.gameStatus,
            });
        },

        resetGame: () =>
            set({
                gameStatus: 'idle',
                score: 0,
                level: 1,
                combo: 0,
                multiplier: 1,
                lives: LIVES_CONFIG.INITIAL_LIVES,
                wordsCompleted: 0,
                wordsInLevel: 0,
                totalWordsCompleted: 0,
            }),
    })),
);
