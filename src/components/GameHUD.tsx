/**
 * Game HUD — Score, Level, Combo, and Lives overlay.
 * Positioned absolute over the Skia canvas.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../stores/game-store';

export function GameHUD() {
    const score = useGameStore((s) => s.score);
    const level = useGameStore((s) => s.level);
    const combo = useGameStore((s) => s.combo);
    const multiplier = useGameStore((s) => s.multiplier);
    const lives = useGameStore((s) => s.lives);
    const wordsInLevel = useGameStore((s) => s.wordsInLevel);

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Top row: Score + Level */}
            <View style={styles.topRow}>
                <View style={styles.scoreBlock}>
                    <Text style={styles.label}>SCORE</Text>
                    <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
                </View>

                <View style={styles.centerBlock}>
                    <Text style={styles.wordsCount}>{wordsInLevel} WORDS</Text>
                </View>

                <View style={styles.levelBlock}>
                    <Text style={styles.levelBadge}>LVL {level}</Text>
                    {multiplier > 1 && (
                        <View style={styles.comboBadge}>
                            <Text style={styles.comboText}>{multiplier}x COMBO</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Lives bar */}
            <View style={styles.livesRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.lifeBar,
                            i < lives ? styles.lifeBarActive : styles.lifeBarDead,
                        ]}
                    />
                ))}
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
        paddingTop: 60,
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
        color: 'rgba(148, 163, 184, 0.7)',
        letterSpacing: 2,
    },
    scoreValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#f1f5f9',
        fontVariant: ['tabular-nums'],
    },
    centerBlock: {
        alignItems: 'center',
        paddingTop: 4,
    },
    wordsCount: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(168, 85, 247, 0.8)',
        letterSpacing: 1.5,
    },
    levelBlock: {
        alignItems: 'flex-end',
        gap: 6,
    },
    levelBadge: {
        fontSize: 14,
        fontWeight: '800',
        color: '#a855f7',
        letterSpacing: 1,
    },
    comboBadge: {
        backgroundColor: 'rgba(250, 204, 21, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(250, 204, 21, 0.4)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    comboText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#facc15',
        letterSpacing: 1,
    },
    livesRow: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 12,
    },
    lifeBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    lifeBarActive: {
        backgroundColor: '#a855f7',
    },
    lifeBarDead: {
        backgroundColor: 'rgba(100, 100, 120, 0.3)',
    },
});
