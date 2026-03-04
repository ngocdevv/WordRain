/**
 * Start Screen — the initial route.
 * Displays the game title and start button.
 * Navigates to /game on start.
 */

import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StatusBar } from 'react-native';

import { StartScreen } from '../src/components/StartScreen';
import { initEngine } from '../src/game/engine';
import { useGameStore } from '../src/stores/game-store';

export default function StartScreenRoute() {
    const startGame = useGameStore((s) => s.startGame);

    const handleStart = useCallback(() => {
        initEngine();
        startGame();
        router.replace('/game');
    }, [startGame]);

    return (
        <>
            <StatusBar barStyle="light-content" />
            <StartScreen onStart={handleStart} />
        </>
    );
}
