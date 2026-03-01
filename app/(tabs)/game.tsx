/**
 * Main Game Screen — composes all game components.
 * Full-screen layout: Canvas → HUD → Native Keyboard Input
 * Dynamically measures keyboard height so words die at the keyboard edge.
 */

import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TextInput,
    useWindowDimensions,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameCanvas } from '../../src/components/GameCanvas';
import { GameHUD } from '../../src/components/GameHUD';
import { GameOverOverlay } from '../../src/components/GameOverOverlay';
import { StartScreen } from '../../src/components/StartScreen';
import { initEngine, processInput } from '../../src/game/engine';
import { useGameStore } from '../../src/stores/game-store';

export default function GameScreen() {
    const { height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [typedText, setTypedText] = useState('');
    const inputRef = useRef<TextInput>(null);
    const [canvasHeight, setCanvasHeight] = useState(0);

    const gameStatus = useGameStore((s) => s.gameStatus);
    const startGame = useGameStore((s) => s.startGame);
    const resetGame = useGameStore((s) => s.resetGame);

    // Measure the actual canvas container height via onLayout
    const handleCanvasLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
        setCanvasHeight(e.nativeEvent.layout.height);
    }, []);

    const handleStart = useCallback(() => {
        initEngine();
        startGame();
        setTypedText('');
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [startGame]);

    const handleRestart = useCallback(() => {
        resetGame();
        initEngine();
        startGame();
        setTypedText('');
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [resetGame, startGame]);

    const handleTextChange = useCallback(
        (text: string) => {
            setTypedText(text);

            const result = processInput(text);
            if (result.completed) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTypedText('');
            }
        },
        [],
    );

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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <StatusBar barStyle="light-content" />

            {/* Skia game canvas — fills remaining space above keyboard */}
            <View style={styles.canvasContainer} onLayout={handleCanvasLayout}>
                {canvasHeight > 0 && (
                    <GameCanvas height={canvasHeight} />
                )}
                <GameHUD />
            </View>

            {/* Native text input — styled as the input bar above keyboard */}
            <View style={styles.inputBar}>
                <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    value={typedText}
                    onChangeText={handleTextChange}
                    placeholder="Type the words..."
                    placeholderTextColor="rgba(148, 163, 184, 0.4)"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus={gameStatus === 'playing'}
                    keyboardAppearance="dark"
                    selectionColor="#a855f7"
                    showSoftInputOnFocus={true}
                    onBlur={() => {
                        if (gameStatus === 'playing') {
                            setTimeout(() => inputRef.current?.focus(), 50);
                        }
                    }}
                />
            </View>

            {/* Game Over overlay */}
            {gameStatus === 'gameover' && (
                <GameOverOverlay onRestart={handleRestart} />
            )}
        </KeyboardAvoidingView>
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
    inputBar: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(100, 100, 140, 0.25)',
        backgroundColor: 'rgba(10, 10, 26, 0.95)',
    },
    textInput: {
        height: 48,
        backgroundColor: 'rgba(30, 30, 55, 0.9)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.4)',
        paddingHorizontal: 16,
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        color: '#e2e8f0',
        letterSpacing: 2,
    },
});
