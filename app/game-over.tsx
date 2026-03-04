/**
 * Game Over Screen — displays final score and action buttons.
 * Restart → navigates to /game.
 * Back to Menu → resets store and navigates to /.
 */

import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StatusBar } from 'react-native';

import { GameOverOverlay } from '../src/components/GameOverOverlay';
import { initEngine } from '../src/game/engine';
import { useGameStore } from '../src/stores/game-store';

export default function GameOverRoute() {
    const resetGame = useGameStore((s) => s.resetGame);
    const startGame = useGameStore((s) => s.startGame);

    const handleRestart = useCallback(() => {
        resetGame();
        initEngine();
        startGame();
        router.replace('/game');
    }, [resetGame, startGame]);

    const handleBackToMenu = useCallback(() => {
        resetGame();
        router.replace('/');
    }, [resetGame]);

    return (
        <>
            <StatusBar barStyle="light-content" />
            <GameOverOverlay
                onRestart={handleRestart}
                onBackToMenu={handleBackToMenu}
            />
        </>
    );
}
