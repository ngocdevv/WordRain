/**
 * Game Over — full-screen result page.
 * Displays final score, stats, and action buttons.
 * Uses manual fade-up animation via useEffect + useSharedValue.
 */

import React, { useEffect } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../stores/game-store';

interface GameOverOverlayProps {
    onRestart: () => void;
    onBackToMenu: () => void;
}

function getRankInfo(score: number): { emoji: string; label: string } {
    if (score >= 5000) return { emoji: '🏆', label: 'Legendary!' };
    if (score >= 3000) return { emoji: '🥇', label: 'Amazing!' };
    if (score >= 1500) return { emoji: '🥈', label: 'Great Job!' };
    if (score >= 500) return { emoji: '🥉', label: 'Not Bad!' };
    return { emoji: '💪', label: 'Keep Going!' };
}

/** Hook: returns an animated style that fades up from offset → 0 */
function useFadeUp(delay: number, duration = 500, offset = 30) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(offset);

    useEffect(() => {
        const timingConfig = { duration, easing: Easing.out(Easing.cubic) };
        opacity.value = withDelay(delay, withTiming(1, timingConfig));
        translateY.value = withDelay(delay, withTiming(0, timingConfig));
    }, []);

    return useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));
}

export function GameOverOverlay({ onRestart, onBackToMenu }: GameOverOverlayProps) {
    const insets = useSafeAreaInsets();
    const score = useGameStore((s) => s.score);
    const level = useGameStore((s) => s.level);
    const totalWords = useGameStore((s) => s.totalWordsCompleted);

    const { emoji, label } = getRankInfo(score);
    const avgPerWord = totalWords > 0 ? Math.round(score / totalWords) : 0;

    // Staggered fade-up styles
    const titleStyle = useFadeUp(0);
    const rankStyle = useFadeUp(200);
    const labelStyle = useFadeUp(350);
    const scoreStyle = useFadeUp(500);
    const statsStyle = useFadeUp(700);
    const buttonsStyle = useFadeUp(900);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `🌧️ Word Rain — I scored ${score.toLocaleString()} points!\n${totalWords} words • Level ${level}\n#WordRain`,
            });
        } catch { }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
            {/* Title */}
            <Animated.Text style={[styles.gameOverText, titleStyle]}>
                GAME OVER
            </Animated.Text>

            {/* Rank */}
            <Animated.Text style={[styles.rankEmoji, rankStyle]}>
                {emoji}
            </Animated.Text>
            <Animated.Text style={[styles.rankLabel, labelStyle]}>
                {label}
            </Animated.Text>

            {/* Score card */}
            <Animated.View style={[styles.scoreCard, scoreStyle]}>
                <Text style={styles.scoreLabel}>FINAL SCORE</Text>
                <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
            </Animated.View>

            {/* Stats row */}
            <Animated.View style={[styles.statsRow, statsStyle]}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{totalWords}</Text>
                    <Text style={styles.statCaption}>Words</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{avgPerWord}</Text>
                    <Text style={styles.statCaption}>Avg/Word</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>Lv.{level}</Text>
                    <Text style={styles.statCaption}>Reached</Text>
                </View>
            </Animated.View>

            {/* Buttons */}
            <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
                <Pressable
                    onPress={onRestart}
                    style={({ pressed }) => [
                        styles.playAgainBtn,
                        pressed && styles.playAgainPressed,
                    ]}
                >
                    <Text style={styles.playAgainText}>PLAY AGAIN</Text>
                </Pressable>

                <Pressable
                    onPress={handleShare}
                    style={({ pressed }) => [
                        styles.shareBtn,
                        pressed && styles.sharePressed,
                    ]}
                >
                    <Text style={styles.shareText}>↗ Share Score</Text>
                </Pressable>

                <Pressable
                    onPress={onBackToMenu}
                    style={({ pressed }) => [
                        styles.menuBtn,
                        pressed && styles.menuPressed,
                    ]}
                >
                    <Text style={styles.menuText}>Back to Menu</Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0a0a1a',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    gameOverText: {
        fontSize: 42,
        fontWeight: '900',
        color: '#ec4899',
        letterSpacing: 6,
        marginBottom: 20,
    },
    rankEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    rankLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: 32,
    },
    scoreCard: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        backgroundColor: 'rgba(20, 20, 45, 0.8)',
        marginBottom: 24,
    },
    scoreLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(148, 163, 184, 0.5)',
        letterSpacing: 3,
        marginBottom: 8,
    },
    scoreValue: {
        fontSize: 52,
        fontWeight: '900',
        color: '#f1f5f9',
        fontVariant: ['tabular-nums'],
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        gap: 0,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: '#f1f5f9',
        fontVariant: ['tabular-nums'],
    },
    statCaption: {
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(148, 163, 184, 0.5)',
        marginTop: 4,
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
    },
    buttonsContainer: {
        width: '100%',
        gap: 14,
    },
    playAgainBtn: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        backgroundColor: '#22d3ee',
        alignItems: 'center',
    },
    playAgainPressed: {
        backgroundColor: '#06b6d4',
    },
    playAgainText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0a0a1a',
        letterSpacing: 3,
    },
    shareBtn: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#a855f7',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    sharePressed: {
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
    },
    shareText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#a855f7',
        letterSpacing: 1,
    },
    menuBtn: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.25)',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    menuPressed: {
        backgroundColor: 'rgba(148, 163, 184, 0.08)',
    },
    menuText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(148, 163, 184, 0.6)',
        letterSpacing: 0.5,
    },
});
