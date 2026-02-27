/**
 * Main Game Screen — composes all game components.
 * Full-screen layout: Canvas → HUD → InputField → Keyboard
 */

import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomKeyboard } from '../../src/components/CustomKeyboard';
import { GameCanvas } from '../../src/components/GameCanvas';
import { GameHUD } from '../../src/components/GameHUD';
import { GameOverOverlay } from '../../src/components/GameOverOverlay';
import { InputField } from '../../src/components/InputField';
import { StartScreen } from '../../src/components/StartScreen';
import { initEngine, processInput } from '../../src/game/engine';
import { useGameStore } from '../../src/stores/game-store';

export default function GameScreen() {
    const { height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [typedText, setTypedText] = useState('');

    const gameStatus = useGameStore((s) => s.gameStatus);
    const startGame = useGameStore((s) => s.startGame);
    const resetGame = useGameStore((s) => s.resetGame);

    // Estimated layout heights
    const keyboardHeight = 180;
    const inputFieldHeight = 60;
    const canvasHeight = screenHeight - insets.top - keyboardHeight - inputFieldHeight;

    const handleStart = useCallback(() => {
        initEngine();
        startGame();
        setTypedText('');
    }, [startGame]);

    const handleRestart = useCallback(() => {
        resetGame();
        initEngine();
        startGame();
        setTypedText('');
    }, [resetGame, startGame]);

    const handleKeyPress = useCallback(
        (key: string) => {
            const newText = typedText + key;
            setTypedText(newText);

            const result = processInput(newText);
            if (result.completed) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTypedText('');
            } else {
                // Update partial matches
                processInput(newText);
            }
        },
        [typedText],
    );

    const handleBackspace = useCallback(() => {
        const newText = typedText.slice(0, -1);
        setTypedText(newText);
        processInput(newText);
    }, [typedText]);

    const handleClear = useCallback(() => {
        setTypedText('');
        processInput('');
    }, []);

    // ── Idle / Start Screen ──────────────────────────────────
    if (gameStatus === 'idle') {
        return (
            <>
                <StatusBar barStyle="light-content" />
                <StartScreen onStart={handleStart} />
            </>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Skia game canvas */}
            <View style={[styles.canvasContainer, { height: canvasHeight }]}>
                <GameCanvas height={canvasHeight} />
                <GameHUD />
            </View>

            {/* Input field */}
            <InputField value={typedText} onClear={handleClear} />

            {/* Custom keyboard */}
            <CustomKeyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />

            {/* Game Over overlay */}
            {gameStatus === 'gameover' && (
                <GameOverOverlay onRestart={handleRestart} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a1a',
    },
    canvasContainer: {
        flex: 1,
        position: 'relative',
    },
});
