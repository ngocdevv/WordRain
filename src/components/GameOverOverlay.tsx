/**
 * Game Over overlay — shown when lives reach 0.
 * Displays final score and restart button.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../stores/game-store';

interface GameOverOverlayProps {
    onRestart: () => void;
}

export function GameOverOverlay({ onRestart }: GameOverOverlayProps) {
    const score = useGameStore((s) => s.score);
    const level = useGameStore((s) => s.level);
    const totalWords = useGameStore((s) => s.totalWordsCompleted);

    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                <Text style={styles.gameOverText}>GAME OVER</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Final Score</Text>
                        <Text style={styles.statValue}>{score.toLocaleString()}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Level Reached</Text>
                        <Text style={styles.statValue}>{level}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Words Typed</Text>
                        <Text style={styles.statValue}>{totalWords}</Text>
                    </View>
                </View>

                <Pressable
                    onPress={onRestart}
                    style={({ pressed }) => [
                        styles.restartButton,
                        pressed && styles.restartPressed,
                    ]}
                >
                    <Text style={styles.restartText}>PLAY AGAIN</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(20, 15, 40, 0.95)',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    gameOverText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#f87171',
        letterSpacing: 4,
        marginBottom: 28,
    },
    statsContainer: {
        width: '100%',
        marginBottom: 28,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    statLabel: {
        fontSize: 14,
        color: 'rgba(148, 163, 184, 0.7)',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#f1f5f9',
        fontVariant: ['tabular-nums'],
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(100, 100, 140, 0.2)',
    },
    restartButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: 'rgba(139, 92, 246, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.5)',
        alignItems: 'center',
    },
    restartPressed: {
        backgroundColor: 'rgba(139, 92, 246, 0.4)',
    },
    restartText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#a855f7',
        letterSpacing: 2,
    },
});
