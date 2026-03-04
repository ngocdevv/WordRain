/**
 * Game Screen — active gameplay.
 * Full-screen layout: Canvas → HUD → Native Keyboard Input.
 * Auto-navigates to /game-over when lives reach zero.
 */

import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { GameCanvas } from '../src/components/GameCanvas';
import { GameHUD } from '../src/components/GameHUD';
import { processInput, updatePartialMatch } from '../src/game/engine';
import { useGameStore } from '../src/stores/game-store';

export default function GameScreenRoute() {
    const [typedText, setTypedText] = useState('');
    const inputRef = useRef<TextInput>(null);
    const [canvasHeight, setCanvasHeight] = useState(0);

    // Shake animation
    const shakeX = useSharedValue(0);
    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    const gameStatus = useGameStore((s) => s.gameStatus);

    // ── Auto-navigate to game-over when status changes ──────
    useEffect(() => {
        if (gameStatus === 'gameover') {
            router.replace('/game-over');
        }
    }, [gameStatus]);

    const handleCanvasLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
        setCanvasHeight(e.nativeEvent.layout.height);
    }, []);

    const handleTextChange = useCallback((text: string) => {
        setTypedText(text);
        updatePartialMatch(text);
    }, []);

    const triggerShake = useCallback(() => {
        const d = 8;
        const t = 50;
        shakeX.value = withSequence(
            withTiming(-d, { duration: t }),
            withTiming(d, { duration: t }),
            withTiming(-d, { duration: t }),
            withTiming(d, { duration: t }),
            withTiming(-d / 2, { duration: t }),
            withTiming(0, { duration: t }),
        );
    }, [shakeX]);

    const handleSubmit = useCallback(() => {
        if (!typedText) return;
        const result = processInput(typedText);
        if (result.completed) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            // Wrong word — shake + error haptic
            triggerShake();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        setTypedText('');
    }, [typedText, triggerShake]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <StatusBar barStyle="light-content" />

            {/* Skia game canvas */}
            <View style={styles.canvasContainer} onLayout={handleCanvasLayout}>
                {canvasHeight > 0 && (
                    <GameCanvas height={canvasHeight} />
                )}
                <GameHUD />
            </View>

            {/* Input bar with shake animation */}
            <Animated.View style={[styles.inputBar, shakeStyle]}>
                <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    value={typedText}
                    onChangeText={handleTextChange}
                    onSubmitEditing={handleSubmit}
                    placeholder="Type the words..."
                    placeholderTextColor="rgba(148, 163, 184, 0.4)"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus
                    keyboardAppearance="dark"
                    selectionColor="#a855f7"
                    showSoftInputOnFocus={true}
                    blurOnSubmit={false}
                    onBlur={() => {
                        if (gameStatus === 'playing') {
                            setTimeout(() => inputRef.current?.focus(), 50);
                        }
                    }}
                />
            </Animated.View>
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
