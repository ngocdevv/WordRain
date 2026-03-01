/**
 * Game HUD — Score, Level, Combo, and Lives overlay.
 * Positioned absolute over the Skia canvas.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../stores/game-store';

export function GameHUD() {
    const insets = useSafeAreaInsets();
    const score = useGameStore((s) => s.score);
    const level = useGameStore((s) => s.level);
    const multiplier = useGameStore((s) => s.multiplier);
    const wordsInLevel = useGameStore((s) => s.wordsInLevel);

    return (
        <View
            style={[styles.container, { paddingTop: insets.top + 8 }]}
            pointerEvents="none"
        >
            <View style={styles.topRow}>
                {/* Left — Score */}
                <View style={styles.scoreBlock}>
                    <Text style={styles.label}>SCORE</Text>
                    <Text style={styles.scoreValue}>
                        {score.toLocaleString()}
                    </Text>
                </View>

                {/* Right — Level, Combo, Words */}
                <View style={styles.rightBlock}>
                    <View style={styles.levelPill}>
                        <Text style={styles.levelText}>LVL {level}</Text>
                    </View>

                    {multiplier > 1 && (
                        <View style={styles.comboPill}>
                            <Text style={styles.comboText}>
                                {multiplier}x COMBO
                            </Text>
                        </View>
                    )}

                    <Text style={styles.wordsCount}>
                        {wordsInLevel} words
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    scoreBlock: {
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(148, 163, 184, 0.6)',
        letterSpacing: 2,
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#f1f5f9',
        fontVariant: ['tabular-nums'],
        marginTop: 2,
    },
    rightBlock: {
        alignItems: 'flex-end',
        gap: 6,
    },
    levelPill: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.6)',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 5,
    },
    levelText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#22c55e',
        letterSpacing: 1.5,
    },
    comboPill: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 5,
    },
    comboText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#ef4444',
        letterSpacing: 1,
    },
    wordsCount: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(148, 163, 184, 0.5)',
        letterSpacing: 0.5,
        marginTop: 2,
    },
});
