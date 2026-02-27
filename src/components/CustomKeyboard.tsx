/**
 * Custom QWERTY keyboard for Word Rain.
 * Instant response, haptic feedback, neon dark theme.
 */

import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

interface CustomKeyboardProps {
    onKeyPress: (key: string) => void;
    onBackspace: () => void;
}

export function CustomKeyboard({ onKeyPress, onBackspace }: CustomKeyboardProps) {
    const handlePress = useCallback(
        (key: string) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onKeyPress(key);
        },
        [onKeyPress],
    );

    const handleBackspace = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onBackspace();
    }, [onBackspace]);

    return (
        <View style={styles.keyboard}>
            {ROWS.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {rowIndex === 2 && <View style={styles.spacer} />}
                    {row.map((key) => (
                        <KeyButton key={key} label={key} onPress={() => handlePress(key)} />
                    ))}
                    {rowIndex === 2 && (
                        <Pressable
                            onPress={handleBackspace}
                            style={({ pressed }) => [
                                styles.key,
                                styles.backspaceKey,
                                pressed && styles.keyPressed,
                            ]}
                        >
                            <Text style={styles.backspaceText}>⌫</Text>
                        </Pressable>
                    )}
                </View>
            ))}
        </View>
    );
}

function KeyButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
        >
            <Text style={styles.keyText}>{label}</Text>
        </Pressable>
    );
}

const KEY_GAP = 5;

const styles = StyleSheet.create({
    keyboard: {
        paddingHorizontal: 4,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        paddingTop: 8,
        backgroundColor: 'rgba(10, 10, 26, 0.95)',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(139, 92, 246, 0.2)',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: KEY_GAP,
        gap: KEY_GAP,
    },
    key: {
        width: 33,
        height: 44,
        borderRadius: 8,
        backgroundColor: 'rgba(30, 30, 55, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(100, 100, 140, 0.25)',
        // Subtle shadow
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    keyPressed: {
        backgroundColor: 'rgba(139, 92, 246, 0.4)',
        borderColor: 'rgba(139, 92, 246, 0.6)',
        transform: [{ scale: 0.95 }],
    },
    keyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e2e8f0',
    },
    spacer: {
        width: 16,
    },
    backspaceKey: {
        width: 44,
        backgroundColor: 'rgba(40, 20, 40, 0.9)',
        borderColor: 'rgba(180, 80, 80, 0.25)',
    },
    backspaceText: {
        fontSize: 20,
        color: '#f87171',
    },
});
